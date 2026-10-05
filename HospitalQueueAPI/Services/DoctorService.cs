using HospitalQueueAPI.Data;
using HospitalQueueAPI.DTOs.Doctor;
using HospitalQueueAPI.Interfaces;
using HospitalQueueAPI.Models;
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

    private async Task<Doctor?> EnsureDoctorProfileExistsAsync(int doctorUserId)
    {
        var doctor = await _context.Doctors
            .Include(d => d.User)
            .Include(d => d.Department)
            .FirstOrDefaultAsync(d => d.UserId == doctorUserId);

        if (doctor != null)
            return doctor;

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == doctorUserId);

        if (user == null)
            return null;

        var department = await _context.Departments
            .OrderBy(d => d.Id)
            .FirstOrDefaultAsync();

        if (department == null)
        {
            department = new HospitalQueueAPI.Models.Department
            {
                DepartmentName = "General Medicine",
                Description = "Default department for newly created doctors.",
                CreatedAt = DateTime.UtcNow
            };

            _context.Departments.Add(department);
            await _context.SaveChangesAsync();
        }

        var profile = new HospitalQueueAPI.Models.Doctor
        {
            UserId = doctorUserId,
            DepartmentId = department.Id,
            Specialization = "General Medicine",
            ExperienceYears = 0,
            AverageConsultationTime = 15,
            LicenseNumber = $"DOC-{doctorUserId:000000}",
            ConsultationFee = 0m,
            Biography = "Doctor profile created automatically during account setup.",
            CreatedAt = DateTime.UtcNow
        };

        _context.Doctors.Add(profile);
        await _context.SaveChangesAsync();

        return await _context.Doctors
            .Include(d => d.User)
            .Include(d => d.Department)
            .FirstOrDefaultAsync(d => d.UserId == doctorUserId);
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
                .ThenInclude(q => q.AiPredictions)

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

            var latestPrediction = queue?.AiPredictions
                .OrderByDescending(p => p.GeneratedAt)
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
                    queue?.EstimatedWaitTime ?? 0,

                AiPrediction =
                    latestPrediction?.Explanation ?? null
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

            .Include(q => q.AiPredictions)

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
                queue.EstimatedWaitTime ?? 0,

            AiPrediction =
                queue.AiPredictions
                    .OrderByDescending(p => p.GeneratedAt)
                    .Select(p => p.Explanation)
                    .FirstOrDefault()
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

            .Include(q => q.AiPredictions)

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
                q.EstimatedWaitTime ?? 0,

            AiPrediction =
                q.AiPredictions
                    .OrderByDescending(p => p.GeneratedAt)
                    .Select(p => p.Explanation)
                    .FirstOrDefault()

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
                Specialization = d.Specialization ?? string.Empty,
                Biography = d.Biography ?? string.Empty
            })
            .ToListAsync();
    }

    // ============================================================
    // DOCTOR PROFILE
    // ============================================================

    public async Task<DoctorProfileDto?> GetProfileAsync(int doctorUserId)
    {
        var doctor = await EnsureDoctorProfileExistsAsync(doctorUserId);

        if (doctor == null)
            return null;

        return new DoctorProfileDto
        {
            UserId                  = doctor.UserId,
            FirstName               = doctor.User.FirstName ?? "",
            LastName                = doctor.User.LastName  ?? "",
            Email                   = doctor.User.Email     ?? "",
            Phone                   = doctor.User.Phone     ?? "",
            Specialization          = doctor.Specialization,
            Department              = doctor.Department?.DepartmentName,
            ExperienceYears         = doctor.ExperienceYears,
            AverageConsultationTime = doctor.AverageConsultationTime,
            LicenseNumber           = doctor.LicenseNumber,
            ConsultationFee         = doctor.ConsultationFee,
            Biography               = doctor.Biography,
            CreatedAt               = doctor.CreatedAt
        };
    }

    public async Task<DoctorProfileDto?> UpdateProfileAsync(int doctorUserId, UpdateDoctorProfileDto request)
    {
        var doctor = await EnsureDoctorProfileExistsAsync(doctorUserId);

        if (doctor == null)
            return null;

        if (request.Specialization          != null) doctor.Specialization          = request.Specialization;
        if (request.ExperienceYears         != null) doctor.ExperienceYears         = request.ExperienceYears;
        if (request.AverageConsultationTime != null) doctor.AverageConsultationTime = request.AverageConsultationTime.Value;
        if (request.LicenseNumber           != null) doctor.LicenseNumber           = request.LicenseNumber;
        if (request.ConsultationFee         != null) doctor.ConsultationFee         = request.ConsultationFee;
        if (request.Biography               != null) doctor.Biography               = request.Biography;

        await _context.SaveChangesAsync();

        return new DoctorProfileDto
        {
            UserId                  = doctor.UserId,
            FirstName               = doctor.User.FirstName ?? "",
            LastName                = doctor.User.LastName  ?? "",
            Email                   = doctor.User.Email     ?? "",
            Phone                   = doctor.User.Phone     ?? "",
            Specialization          = doctor.Specialization,
            Department              = doctor.Department?.DepartmentName,
            ExperienceYears         = doctor.ExperienceYears,
            AverageConsultationTime = doctor.AverageConsultationTime,
            LicenseNumber           = doctor.LicenseNumber,
            ConsultationFee         = doctor.ConsultationFee,
            Biography               = doctor.Biography,
            CreatedAt               = doctor.CreatedAt
        };
    }
}