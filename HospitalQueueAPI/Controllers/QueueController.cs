using HospitalQueueAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HospitalQueueAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class QueueController : ControllerBase
{
    private readonly IQueueService _queueService;

    public QueueController(IQueueService queueService)
    {
        _queueService = queueService;
    }


    //=====================================================
    // GET MY QUEUE STATUS (PATIENT)
    //=====================================================

    [HttpGet("my")]
    [Authorize(Roles = "Patient")]
    public async Task<IActionResult> GetMyQueue()
    {
        var userId = GetCurrentUserId();

        var queue =
            await _queueService.GetMyQueueAsync(userId);

        if (queue == null)
            return NotFound(new
            {
                message = "No queue entry found."
            });

        return Ok(queue);
    }



    //=====================================================
    // GET TODAY'S QUEUE (DOCTOR / ADMIN)
    //=====================================================

    [HttpGet("today")]
    [Authorize(Roles = "Doctor,Admin")]
    public async Task<IActionResult> GetTodayQueue()
    {
        var queues =
            await _queueService.GetTodaysQueueAsync();

        return Ok(queues);
    }



    //=====================================================
    // GENERATE QUEUE ENTRY
    //=====================================================

    [HttpPost("{appointmentId}")]
    [Authorize(Roles = "Patient")]
    public async Task<IActionResult> GenerateQueue(
        int appointmentId)
    {
        var queue =
            await _queueService
            .GenerateQueueEntryAsync(appointmentId);

        if (queue == null)
        {
            return BadRequest(new
            {
                message = "Unable to generate queue entry."
            });
        }

        return Ok(queue);
    }



    //=====================================================
    // CALL NEXT PATIENT
    //=====================================================

    [HttpPut("call-next")]
    [Authorize(Roles = "Doctor,Admin")]
    public async Task<IActionResult> CallNextPatient()
    {
        var queue =
            await _queueService.CallNextPatientAsync();

        if (queue == null)
        {
            return NotFound(new
            {
                message = "No patients are waiting."
            });
        }

        return Ok(queue);
    }



    //=====================================================
    // COMPLETE CONSULTATION
    //=====================================================

    [HttpPut("{queueId}/complete")]
    [Authorize(Roles = "Doctor,Admin")]
    public async Task<IActionResult> CompleteConsultation(
        int queueId)
    {
        var result =
            await _queueService
            .CompleteConsultationAsync(queueId);

        if (!result)
        {
            return NotFound(new
            {
                message = "Queue entry not found."
            });
        }


        return Ok(new
        {
            message = "Consultation completed successfully."
        });
    }



    //=====================================================
    // GET CURRENT USER ID FROM JWT
    //=====================================================

    private int GetCurrentUserId()
    {
        var userId =
            User.FindFirst(
                ClaimTypes.NameIdentifier)?.Value;


        if (userId == null)
            throw new UnauthorizedAccessException();


        return int.Parse(userId);
    }
    [HttpGet("{queueId}/summary")]
public async Task<IActionResult> Summary(int queueId)
{
    return Ok(await _queueService.GetPatientSummaryAsync(queueId));
}

[HttpPost("{queueId}/refresh-ai")]
public async Task<IActionResult> RefreshAI(int queueId)
{
    await _queueService.RegeneratePredictionAsync(queueId);

    return Ok("AI Prediction Updated");
}

[HttpGet("patient-summary/{appointmentId}")]
public async Task<IActionResult> PatientSummary(int appointmentId)
{
    return Ok(await _queueService.GetQueueSummaryAsync());
}
}

