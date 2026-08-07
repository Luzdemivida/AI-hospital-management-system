using System.Security.Claims;
using HospitalQueueAPI.DTOs.Appointment;
using HospitalQueueAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HospitalQueueAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AppointmentController : ControllerBase
{
    private readonly IAppointmentService _appointmentService;

    public AppointmentController(IAppointmentService appointmentService)
    {
        _appointmentService = appointmentService;
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (claim == null)
            throw new UnauthorizedAccessException();

        return int.Parse(claim.Value);
    }

    [HttpPost]
    public async Task<IActionResult> BookAppointment(
        CreateAppointmentDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        var result =
            await _appointmentService.CreateAppointmentAsync(
                userId,
                request);

        if (!result.Success)
            return BadRequest(new { message = result.ErrorMessage });

        return Ok(result.Appointment);
    }

    [HttpGet("my")]
    public async Task<IActionResult> MyAppointments()
    {
        var userId = GetCurrentUserId();

        var appointments =
            await _appointmentService.GetMyAppointmentsAsync(userId);

        return Ok(appointments);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> CancelAppointment(int id)
    {
        var userId = GetCurrentUserId();

        var success =
            await _appointmentService.CancelAppointmentAsync(id, userId);

        if (!success)
            return NotFound();

        return Ok(new
        {
            message = "Appointment cancelled successfully."
        });
    }
}