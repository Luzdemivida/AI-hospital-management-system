using HospitalQueueAPI.DTOs.Admin;
using HospitalQueueAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HospitalQueueAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    // ===========================
    // Dashboard
    // ===========================

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var dashboard = await _adminService.GetDashboardAsync();

        return Ok(dashboard);
    }

    // ===========================
    // Users
    // ===========================

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _adminService.GetAllUsersAsync();

        return Ok(users);
    }

    [HttpGet("users/{id}")]
    public async Task<IActionResult> GetUser(int id)
    {
        var user = await _adminService.GetUserByIdAsync(id);

        if (user == null)
            return NotFound("User not found.");

        return Ok(user);
    }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(
        int id,
        UpdateUserDto request)
    {
        var success = await _adminService.UpdateUserAsync(id, request);

        if (!success)
            return NotFound("User not found.");

        return Ok("User updated successfully.");
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var success = await _adminService.DeleteUserAsync(id);

        if (!success)
            return NotFound("User not found.");

        return Ok("User deleted successfully.");
    }

    [HttpPut("users/{id}/activate")]
    public async Task<IActionResult> ActivateUser(int id)
    {
        var success = await _adminService.ActivateUserAsync(id);

        if (!success)
            return NotFound("User not found.");

        return Ok("User activated.");
    }

    [HttpPut("users/{id}/deactivate")]
    public async Task<IActionResult> DeactivateUser(int id)
    {
        var success = await _adminService.DeactivateUserAsync(id);

        if (!success)
            return NotFound("User not found.");

        return Ok("User deactivated.");
    }

    // ===========================
    // Statistics
    // ===========================

    [HttpGet("statistics")]
    public async Task<IActionResult> Statistics()
    {
        var statistics = await _adminService.GetStatisticsAsync();

        return Ok(statistics);
    }
}