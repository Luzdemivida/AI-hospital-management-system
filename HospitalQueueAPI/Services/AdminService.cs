using BCrypt.Net;
using HospitalQueueAPI.Data;
using HospitalQueueAPI.DTOs.Admin;
using HospitalQueueAPI.Interfaces;
using HospitalQueueAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace HospitalQueueAPI.Services;

public class AdminService : IAdminService
{
    private readonly ApplicationDbContext _context;

    public AdminService(ApplicationDbContext context)
    {
        _context = context;
    }

    // ===================================================
    // Dashboard
    // ===================================================

    public async Task<DashboardResponseDto> GetDashboardAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.Today);

        var totalPatients =
            await _context.Patients.CountAsync();

        var totalDoctors =
            await _context.Doctors.CountAsync();

        var totalDepartments =
            await _context.Departments.CountAsync();

        var totalAppointments =
            await _context.Appointments.CountAsync();

        var todayAppointments =
            await _context.Appointments
                .CountAsync(a => a.AppointmentDate == today);

        var waitingPatients =
            await _context.QueueEntries
                .CountAsync(q => q.Status == "Waiting");

        var servingPatients =
            await _context.QueueEntries
                .CountAsync(q => q.Status == "Serving");

        var completedPatients =
            await _context.QueueEntries
                .CountAsync(q => q.Status == "Completed");

        var averageWaitTime =
            await _context.QueueEntries
                .Where(q => q.ActualWaitTime != null)
                .AverageAsync(q => (double?)q.ActualWaitTime) ?? 0;

        return new DashboardResponseDto
        {
            TotalPatients = totalPatients,
            TotalDoctors = totalDoctors,
            TotalDepartments = totalDepartments,
            TotalAppointments = totalAppointments,
            TodayAppointments = todayAppointments,
            WaitingPatients = waitingPatients,
            ServingPatients = servingPatients,
            CompletedPatients = completedPatients,
            AverageWaitTime = averageWaitTime
        };
    }

    // ===================================================
    // CREATE USER (Admin-only — for Doctor / Admin accounts)
    // ===================================================

    public async Task<(bool Success, string Message, UserDto? User)> CreateUserAsync(CreateUserDto request)
    {
        // Only Doctor and Admin roles are allowed through this path.
        // Patients self-register via POST /api/Auth/register.
        string role = request.Role.Trim().ToUpperInvariant() switch
        {
            "DOCTOR" => "Doctor",
            "ADMIN"  => "Admin",
            _        => ""
        };

        if (string.IsNullOrEmpty(role))
        {
            return (false,
                "Invalid role. Only 'Doctor' or 'Admin' accounts can be created through this endpoint.",
                null);
        }

        string email = request.Email.Trim().ToLowerInvariant();

        bool exists = await _context.Users
            .AnyAsync(u => u.Email.ToLower() == email);

        if (exists)
            return (false, "A user with that email address already exists.", null);

        if (string.IsNullOrWhiteSpace(request.Password))
            return (false, "A temporary password is required.", null);

        var user = new User
        {
            FirstName    = request.FirstName.Trim(),
            LastName     = request.LastName.Trim(),
            Email        = email,
            Phone        = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role         = role,
            Status       = "Active",
            CreatedAt    = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        if (role == "Doctor")
        {
            var department = await _context.Departments
                .OrderBy(d => d.Id)
                .FirstOrDefaultAsync();

            if (department == null)
            {
                department = new Department
                {
                    DepartmentName = "General Medicine",
                    Description = "Default department for newly created doctors.",
                    CreatedAt = DateTime.UtcNow
                };

                _context.Departments.Add(department);
                await _context.SaveChangesAsync();
            }

            var doctorProfile = new Doctor
            {
                UserId = user.Id,
                DepartmentId = department.Id,
                Specialization = "General Medicine",
                ExperienceYears = 0,
                AverageConsultationTime = 15,
                LicenseNumber = $"DOC-{user.Id:000000}",
                ConsultationFee = 0m,
                Biography = "Doctor profile created automatically during account setup.",
                CreatedAt = DateTime.UtcNow
            };

            _context.Doctors.Add(doctorProfile);
            await _context.SaveChangesAsync();
        }

        var dto = new UserDto
        {
            Id        = user.Id,
            FirstName = user.FirstName,
            LastName  = user.LastName,
            Email     = user.Email,
            Role      = user.Role,
            Status    = user.Status ?? "Active"
        };

        return (true, $"{role} account created successfully.", dto);
    }

    // ===================================================
    // USERS
    // ===================================================

    public async Task<List<UserDto>> GetAllUsersAsync()
    {
        return await _context.Users
            .OrderBy(u => u.Id)
            .Select(u => new UserDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                Role = u.Role,
                Status = u.Status ?? "Active"
            })
            .ToListAsync();
    }

    public async Task<UserDto?> GetUserByIdAsync(int id)
    {
        return await _context.Users
            .Where(u => u.Id == id)
            .Select(u => new UserDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                Role = u.Role,
                Status = u.Status ?? "Active"
            })
            .FirstOrDefaultAsync();
    }

    public async Task<bool> UpdateUserAsync(
        int id,
        UpdateUserDto request)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return false;

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Phone = request.Phone;
        user.Status = request.Status;

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteUserAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return false;

        _context.Users.Remove(user);

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ActivateUserAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return false;

        user.Status = "Active";

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeactivateUserAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return false;

        user.Status = "Inactive";

        await _context.SaveChangesAsync();

        return true;
    }

    // ===================================================
    // STATISTICS
    // ===================================================

    public async Task<UserStatisticsDto> GetStatisticsAsync()
    {
        return new UserStatisticsDto
        {
            TotalUsers =
                await _context.Users.CountAsync(),

            TotalDoctors =
                await _context.Users.CountAsync(u => u.Role == "Doctor"),

            TotalPatients =
                await _context.Users.CountAsync(u => u.Role == "Patient"),

            TotalAdmins =
                await _context.Users.CountAsync(u => u.Role == "Admin")
        };
    }
}