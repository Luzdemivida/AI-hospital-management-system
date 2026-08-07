using HospitalQueueAPI.Data;
using HospitalQueueAPI.DTOs.Admin;
using HospitalQueueAPI.Interfaces;
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