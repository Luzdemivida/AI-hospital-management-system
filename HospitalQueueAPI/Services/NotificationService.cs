using HospitalQueueAPI.Data;
using HospitalQueueAPI.Hubs;
using HospitalQueueAPI.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace HospitalQueueAPI.Services;

public class NotificationService
{
    private readonly ApplicationDbContext _context;
    private readonly IHubContext<QueueHub> _hubContext;

    public NotificationService(
        ApplicationDbContext context,
        IHubContext<QueueHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    public async Task<List<Notification>> GetMyNotificationsAsync(int userId, int take = 20)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(take)
            .ToListAsync();
    }

    public async Task<int> GetUnreadCountAsync(int userId)
    {
        return await _context.Notifications
            .CountAsync(n => n.UserId == userId && (n.IsRead == null || !n.IsRead.Value));
    }

    public async Task MarkAsReadAsync(int notificationId, int userId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification == null)
            return;

        notification.IsRead = true;
        await _context.SaveChangesAsync();
        await _hubContext.Clients.All.SendAsync("NotificationUpdated");
    }

    public async Task<Notification?> CreateNotificationAsync(
        int userId,
        string title,
        string message,
        string notificationType = "General")
    {
        if (userId <= 0)
            return null;

        var trimmedTitle = title?.Trim();
        var trimmedMessage = message?.Trim();

        if (string.IsNullOrWhiteSpace(trimmedTitle) || string.IsNullOrWhiteSpace(trimmedMessage))
            return null;

        var recentDuplicate = await _context.Notifications
            .AnyAsync(n =>
                n.UserId == userId &&
                n.Title == trimmedTitle &&
                n.Message == trimmedMessage &&
                n.CreatedAt >= DateTime.UtcNow.AddDays(-7));

        if (recentDuplicate)
            return null;

        var notification = new Notification
        {
            UserId = userId,
            Title = trimmedTitle,
            Message = trimmedMessage,
            NotificationType = notificationType,
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        await _hubContext.Clients.All.SendAsync("NotificationUpdated");

        return notification;
    }

    public async Task<List<Notification>> CheckAndCreateDueNotificationsAsync(int userId)
    {
        var createdNotifications = new List<Notification>();
        var now = DateTime.UtcNow;

        var appointments = await _context.Appointments
            .Where(a => a.PatientId == userId && a.Status != "Cancelled")
            .ToListAsync();

        foreach (var appointment in appointments)
        {
            var appointmentDateTime = appointment.AppointmentDate.ToDateTime(appointment.AppointmentTime);
            var minutesUntilAppointment = (appointmentDateTime - now).TotalMinutes;

            if (minutesUntilAppointment < 0)
                continue;

            if (minutesUntilAppointment <= 5)
            {
                var reminder = await CreateNotificationAsync(
                    userId,
                    "Consultation reminder",
                    $"Your consultation with Dr. {appointment.DoctorId} is due in 5 minutes. Please proceed to the consultation area.",
                    "Appointment");

                if (reminder != null)
                    createdNotifications.Add(reminder);

                continue;
            }

            if (minutesUntilAppointment <= 24 * 60)
            {
                var reminder = await CreateNotificationAsync(
                    userId,
                    "Upcoming appointment",
                    $"Your appointment is scheduled for {appointment.AppointmentDate:yyyy-MM-dd} at {appointment.AppointmentTime:hh:mm tt}. Please be ready.",
                    "Appointment");

                if (reminder != null)
                    createdNotifications.Add(reminder);
            }
        }

        return createdNotifications;
    }
}
