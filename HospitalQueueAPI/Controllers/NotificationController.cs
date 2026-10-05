using System.Security.Claims;
using HospitalQueueAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HospitalQueueAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly NotificationService _notificationService;

    public NotificationController(NotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyNotifications()
    {
        var userId = GetCurrentUserId();
        var notifications = await _notificationService.GetMyNotificationsAsync(userId);
        return Ok(notifications);
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var userId = GetCurrentUserId();
        var count = await _notificationService.GetUnreadCountAsync(userId);
        return Ok(new { count });
    }

    [HttpPost("check-reminders")]
    public async Task<IActionResult> CheckReminders()
    {
        var userId = GetCurrentUserId();
        var notifications = await _notificationService.CheckAndCreateDueNotificationsAsync(userId);
        return Ok(notifications);
    }

    [HttpPut("{notificationId}/read")]
    public async Task<IActionResult> MarkAsRead(int notificationId)
    {
        var userId = GetCurrentUserId();
        await _notificationService.MarkAsReadAsync(notificationId, userId);
        return Ok(new { message = "Notification marked as read." });
    }

    private int GetCurrentUserId()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
            throw new UnauthorizedAccessException();

        return int.Parse(userId);
    }
}
