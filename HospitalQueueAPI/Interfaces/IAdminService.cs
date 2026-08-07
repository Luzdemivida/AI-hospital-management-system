using HospitalQueueAPI.DTOs.Admin;

namespace HospitalQueueAPI.Interfaces;

public interface IAdminService
{
    Task<DashboardResponseDto> GetDashboardAsync();

    Task<List<UserDto>> GetAllUsersAsync();

    Task<UserDto?> GetUserByIdAsync(int id);

    Task<bool> UpdateUserAsync(int id, UpdateUserDto request);

    Task<bool> DeleteUserAsync(int id);

    Task<bool> ActivateUserAsync(int id);

    Task<bool> DeactivateUserAsync(int id);

    Task<UserStatisticsDto> GetStatisticsAsync();
}