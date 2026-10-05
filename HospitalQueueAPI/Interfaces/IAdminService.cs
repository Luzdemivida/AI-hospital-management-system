using HospitalQueueAPI.DTOs.Admin;

namespace HospitalQueueAPI.Interfaces;

public interface IAdminService
{
    Task<DashboardResponseDto> GetDashboardAsync();

    /// <summary>
    /// Creates a Doctor or Admin account. Only callable by an authenticated Admin.
    /// </summary>
    Task<(bool Success, string Message, UserDto? User)> CreateUserAsync(CreateUserDto request);

    Task<List<UserDto>> GetAllUsersAsync();

    Task<UserDto?> GetUserByIdAsync(int id);

    Task<bool> UpdateUserAsync(int id, UpdateUserDto request);

    Task<bool> DeleteUserAsync(int id);

    Task<bool> ActivateUserAsync(int id);

    Task<bool> DeactivateUserAsync(int id);

    Task<UserStatisticsDto> GetStatisticsAsync();
}