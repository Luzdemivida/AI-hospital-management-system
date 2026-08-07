using HospitalQueueAPI.Data;
using HospitalQueueAPI.DTOs.Appointment;
using HospitalQueueAPI.Interfaces;
using HospitalQueueAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace HospitalQueueAPI.Services;

public class AppointmentService : IAppointmentService
{
    private readonly ApplicationDbContext _context;
    private readonly IQueueService _queueService;

    public AppointmentService(
        ApplicationDbContext context,
        IQueueService queueService)
    {
        _context = context;
        _queueService = queueService;
    }

    public async Task<AppointmentCreationResult> CreateAppointmentAsync(
        int userId,
        CreateAppointmentDto request)
    {
        var patient = await _context.Patients
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (patient == null)
        {
            return new AppointmentCreationResult
            {
                Success = false,
                ErrorMessage = "Patient profile not found. Create a patient profile before booking an appointment."
            };
        }

        var doctor = await _context.Doctors
            .Include(d => d.User)
            .Include(d => d.Department)
            .FirstOrDefaultAsync(d => d.UserId == request.DoctorId);

        if (doctor == null)
        {
            return new AppointmentCreationResult
            {
                Success = false,
                ErrorMessage = $"Doctor not found for DoctorId {request.DoctorId}."
            };
        }

        var appointment = new Appointment
        {
            PatientId = patient.UserId,
            DoctorId = doctor.UserId,
            AppointmentDate = DateOnly.FromDateTime(request.AppointmentDate!.Value),
            AppointmentTime = TimeOnly.FromDateTime(request.AppointmentDate.Value),
            Reason = request.Reason,
            BookingType = "Online",
            Priority = "Normal",
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _context.Appointments.Add(appointment);

        await _context.SaveChangesAsync();

        await _queueService.GenerateQueueEntryAsync(appointment.Id);

        var user = await _context.Users
            .FirstAsync(u => u.Id == userId);

        return new AppointmentCreationResult
        {
            Success = true,
            Appointment = new AppointmentResponseDto
            {
                AppointmentId = appointment.Id,
                PatientName = $"{user.FirstName} {user.LastName}",
                DoctorName = $"{doctor.User.FirstName} {doctor.User.LastName}",
                Department = doctor.Department.DepartmentName,
                AppointmentDate = appointment.AppointmentDate.ToDateTime(appointment.AppointmentTime),
                Status = appointment.Status ?? "Pending"
            }
        };
    }

    public async Task<List<AppointmentResponseDto>>
        GetMyAppointmentsAsync(int userId)
    {
        var appointments = await _context.Appointments

            .Include(a => a.Doctor)
                .ThenInclude(d => d.User)

            .Include(a => a.Doctor)
                .ThenInclude(d => d.Department)

            .Where(a => a.PatientId == userId)

            .ToListAsync();

        var user = await _context.Users
            .FirstAsync(u => u.Id == userId);

        return appointments.Select(a =>
            new AppointmentResponseDto
            {
                AppointmentId = a.Id,

                PatientName =
                    $"{user.FirstName} {user.LastName}",

                DoctorName =
                    $"{a.Doctor.User.FirstName} {a.Doctor.User.LastName}",

                Department =
                    a.Doctor.Department.DepartmentName,

                AppointmentDate =
                    a.AppointmentDate.ToDateTime(
                        a.AppointmentTime),

                Status =
                    a.Status ?? ""
            }).ToList();
    }

    public async Task<bool> CancelAppointmentAsync(
        int appointmentId,
        int userId)
    {
        var appointment = await _context.Appointments
            .FirstOrDefaultAsync(a =>
                a.Id == appointmentId &&
                a.PatientId == userId);

        if (appointment == null)
            return false;

        appointment.Status = "Cancelled";

        await _context.SaveChangesAsync();

        return true;
    }
}