using HospitalQueueAPI.Data;
using HospitalQueueAPI.DTOs.Doctor;
using HospitalQueueAPI.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HospitalQueueAPI.Services;

public class DoctorService : IDoctorService
{
    private readonly ApplicationDbContext _context;
    private readonly IQueueService _queueService;

    public DoctorService(
        ApplicationDbContext context,
        IQueueService queueService)
    {
        _context = context;
        _queueService = queueService;
    }
    // ============================================================
    // TODAY'S PATIENTS
    // ============================================================

    public async Task<List<DoctorDashboardDto>> GetTodaysPatientsAsync(int doctorUserId)
    {
        var today = DateOnly.FromDateTime(DateTime.Today);

        var appointments = await _context.Appointments

            .Include(a => a.Patient)
                .ThenInclude(p => p.User)

            .Include(a => a.Doctor)
                .ThenInclude(d => d.User)

            .Include(a => a.Doctor)
                .ThenInclude(d => d.Department)

            .Include(a => a.QueueEntries)

            .Where(a =>
                a.DoctorId == doctorUserId &&
                a.AppointmentDate == today)

            .OrderBy(a => a.AppointmentTime)

            .ToListAsync();

        var result = appointments.Select(a =>
        {
            var queue = a.QueueEntries
                .OrderBy(q => q.QueueNumber)
                .FirstOrDefault();

            return new DoctorDashboardDto
            {
                QueueId = queue?.Id ?? 0,

                AppointmentId = a.Id,

                QueueNumber = queue?.QueueNumber ?? 0,

                PatientName =
                    $"{a.Patient.User.FirstName} {a.Patient.User.LastName}",

                Department =
                    a.Doctor.Department.DepartmentName,

                AppointmentDate =
                    a.AppointmentDate,

                AppointmentTime =
                    a.AppointmentTime,

                Reason =
                    a.Reason ?? "",

                Status =
                    queue?.Status ?? "Pending",

                CurrentPosition =
                    queue?.CurrentPosition ?? 0,

                EstimatedWaitTime =
                    queue?.EstimatedWaitTime ?? 0
            };
        });

        return result.ToList();
    }

    // ============================================================
    // CURRENT PATIENT
    // ============================================================

    public async Task<DoctorDashboardDto?> GetCurrentPatientAsync(int doctorUserId)
    {
        var queue = await _context.QueueEntries

            .Include(q => q.Appointment)
                .ThenInclude(a => a.Patient)
                    .ThenInclude(p => p.User)

            .Include(q => q.Appointment)
                .ThenInclude(a => a.Doctor)
                    .ThenInclude(d => d.Department)

            .Where(q =>
                q.Status == "Serving" &&
                q.Appointment.DoctorId == doctorUserId)

            .FirstOrDefaultAsync();

        if (queue == null)
            return null;

        return new DoctorDashboardDto
        {
            QueueId = queue.Id,

            AppointmentId = queue.Appointment.Id,

            QueueNumber = queue.QueueNumber,

            PatientName =
                $"{queue.Appointment.Patient.User.FirstName} {queue.Appointment.Patient.User.LastName}",

            Department =
                queue.Appointment.Doctor.Department.DepartmentName,

            AppointmentDate =
                queue.Appointment.AppointmentDate,

            AppointmentTime =
                queue.Appointment.AppointmentTime,

            Reason =
                queue.Appointment.Reason ?? "",

            Status =
                queue.Status ?? "",

            CurrentPosition =
                queue.CurrentPosition ?? 0,

            EstimatedWaitTime =
                queue.EstimatedWaitTime ?? 0
        };
    }

    // ============================================================
    // COMPLETED PATIENTS
    // ============================================================

    public async Task<List<DoctorDashboardDto>> GetCompletedPatientsAsync(int doctorUserId)
    {
        var queues = await _context.QueueEntries

            .Include(q => q.Appointment)
                .ThenInclude(a => a.Patient)
                    .ThenInclude(p => p.User)

            .Include(q => q.Appointment)
                .ThenInclude(a => a.Doctor)
                    .ThenInclude(d => d.Department)

            .Where(q =>
                q.Status == "Completed" &&
                q.Appointment.DoctorId == doctorUserId)

            .OrderByDescending(q => q.ServiceEnd)

            .ToListAsync();

        return queues.Select(q => new DoctorDashboardDto
        {
            QueueId = q.Id,

            AppointmentId = q.Appointment.Id,

            QueueNumber = q.QueueNumber,

            PatientName =
                $"{q.Appointment.Patient.User.FirstName} {q.Appointment.Patient.User.LastName}",

            Department =
                q.Appointment.Doctor.Department.DepartmentName,

            AppointmentDate =
                q.Appointment.AppointmentDate,

            AppointmentTime =
                q.Appointment.AppointmentTime,

            Reason =
                q.Appointment.Reason ?? "",

            Status =
                q.Status ?? "",

            CurrentPosition =
                q.CurrentPosition ?? 0,

            EstimatedWaitTime =
                q.EstimatedWaitTime ?? 0

        }).ToList();
    }

    public async Task<List<DoctorListDto>> GetAllDoctorsAsync()
    {
        return await _context.Doctors
            .Include(d => d.User)
            .Include(d => d.Department)
            .Select(d => new DoctorListDto
            {
                DoctorId = d.UserId,
                FullName = $"{d.User.FirstName} {d.User.LastName}",
                Department = d.Department.DepartmentName,
                Specialization = d.Specialization ?? string.Empty
            })
            .ToListAsync();
    }
}