using System.Security.Claims;
using HospitalQueueAPI.DTOs.Doctor;
using HospitalQueueAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HospitalQueueAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Doctor")]
public class DoctorController : ControllerBase
{
    private readonly IDoctorService _doctorService;
    private readonly IQueueService _queueService;

    public DoctorController(IDoctorService doctorService, IQueueService queueService)
    {
        _doctorService = doctorService;
        _queueService = queueService;
    }

    // ============================================================
    // GET TODAY'S PATIENTS
    // ============================================================

    [HttpGet("today")]
    public async Task<IActionResult> GetTodaysPatients()
    {
        var doctorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (doctorIdClaim == null)
            return Unauthorized();

        int doctorUserId = int.Parse(doctorIdClaim.Value);

        var result = await _doctorService.GetTodaysPatientsAsync(doctorUserId);

        return Ok(result);
    }

    // ============================================================
    // GET CURRENT PATIENT
    // ============================================================

    [HttpGet("current")]
    public async Task<IActionResult> GetCurrentPatient()
    {
        var doctorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (doctorIdClaim == null)
            return Unauthorized();

        int doctorUserId = int.Parse(doctorIdClaim.Value);

        var result = await _doctorService.GetCurrentPatientAsync(doctorUserId);

        if (result == null)
            return NotFound("No patient is currently being served.");

        return Ok(result);
    }

    // ============================================================
    // GET COMPLETED PATIENTS
    // ============================================================

    [HttpGet("completed")]
    public async Task<IActionResult> GetCompletedPatients()
    {
        var doctorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (doctorIdClaim == null)
            return Unauthorized();

        int doctorUserId = int.Parse(doctorIdClaim.Value);

        var result = await _doctorService.GetCompletedPatientsAsync(doctorUserId);

        return Ok(result);
    }

    // ============================================================
    // GET DOCTORS
    // ============================================================

    [AllowAnonymous]
    [HttpGet("list")]
    public async Task<IActionResult> GetDoctors()
    {
        var result = await _doctorService.GetAllDoctorsAsync();
        return Ok(result);
    }

    // ============================================================
    // AI Queue Summary
    // ============================================================

    [HttpGet("ai-summary")]
    public async Task<IActionResult> AiSummary()
    {
        var doctorId = int.Parse(User.FindFirst("sub")!.Value);

        var summary =
            await _queueService.GetAiQueueSummaryAsync(doctorId);

        return Ok(summary);
    }

    // ============================================================
    // Doctor Profile
    // ============================================================

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var doctorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var result = await _doctorService.GetProfileAsync(doctorId);

        if (result == null)
            return NotFound(new { message = "Doctor profile not found." });

        return Ok(result);
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile(UpdateDoctorProfileDto request)
    {
        var doctorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var result = await _doctorService.UpdateProfileAsync(doctorId, request);

        if (result == null)
            return NotFound(new { message = "Doctor profile not found." });

        return Ok(new { success = true, message = "Profile updated successfully.", data = result });
    }
}