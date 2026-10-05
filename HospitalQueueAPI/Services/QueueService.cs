using HospitalQueueAPI.Data;
using HospitalQueueAPI.DTOs.Doctor;
using HospitalQueueAPI.DTOs.Queue;
using HospitalQueueAPI.Interfaces;
using HospitalQueueAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace HospitalQueueAPI.Services;

public class QueueService : IQueueService
{
    private const string ServingMessage = "You are currently being attended to. Please proceed to the consultation area.";

    private static string BuildStatusMessage(string? status, int estimatedWaitTime)
    {
        if (status == "Serving")
            return ServingMessage;

        if (status == "Completed")
            return "Your consultation has been completed.";

        if (estimatedWaitTime > 0)
            return $"Estimated waiting time: {estimatedWaitTime} minutes. Please remain available.";

        return "Your appointment is scheduled.";
    }

    //==========================================================
    // Constructor
    //==========================================================

    private readonly ApplicationDbContext _context;
    private readonly IOllamaService _ollamaService;
    private readonly NotificationService _notificationService;

    public QueueService(
        ApplicationDbContext context,
        IOllamaService ollamaService,
        NotificationService notificationService)
    {
        _context = context;
        _ollamaService = ollamaService;
        _notificationService = notificationService;
    }

//==========================================================
// CREATE QUEUE ENTRY AFTER APPOINTMENT
//==========================================================

public async Task<QueueResponseDto> GenerateQueueEntryAsync(int appointmentId)
{
    var appointment = await _context.Appointments
        .Include(a => a.Doctor)
        .FirstOrDefaultAsync(a => a.Id == appointmentId);

    if (appointment == null)
        throw new Exception("Appointment not found.");

    var todayQueueCount = await _context.QueueEntries
        .Include(q => q.Appointment)
        .CountAsync(q =>
            q.Appointment.AppointmentDate ==
            appointment.AppointmentDate);

    int queueNumber = todayQueueCount + 1;

    int consultationTime =
        appointment.Doctor?.AverageConsultationTime ?? 15;

    var queueEntry = new QueueEntry
    {
        AppointmentId = appointment.Id,
        QueueNumber = queueNumber,
        CurrentPosition = queueNumber,
        EstimatedWaitTime =
            (queueNumber - 1) * consultationTime,
        Status = "Waiting",
        CreatedAt = DateTime.UtcNow
    };

    _context.QueueEntries.Add(queueEntry);

    await _context.SaveChangesAsync();

    // Reload the appointment with all related data
    await _context.Entry(queueEntry)
        .Reference(q => q.Appointment)
        .LoadAsync();

    await _context.Entry(queueEntry.Appointment)
        .Reference(a => a.Patient)
        .LoadAsync();

    await _context.Entry(queueEntry.Appointment.Patient)
        .Reference(p => p.User)
        .LoadAsync();

    await _context.Entry(queueEntry.Appointment)
        .Reference(a => a.Doctor)
        .LoadAsync();

    await _context.Entry(queueEntry.Appointment.Doctor)
        .Reference(d => d.Department)
        .LoadAsync();

    return new QueueResponseDto
    {
        QueueId = queueEntry.Id,
        AppointmentId = queueEntry.AppointmentId,
        QueueNumber = queueEntry.QueueNumber,
        PatientName = $"{queueEntry.Appointment.Patient.User.FirstName} {queueEntry.Appointment.Patient.User.LastName}",
        Department = queueEntry.Appointment.Doctor.Department.DepartmentName ?? "",
        AppointmentDate = queueEntry.Appointment.AppointmentDate,
        AppointmentTime = queueEntry.Appointment.AppointmentTime,
        Reason = queueEntry.Appointment.Reason ?? "",
        Status = queueEntry.Status ?? "Waiting",
        CurrentPosition = queueEntry.CurrentPosition ?? 0,
        EstimatedWaitTime = queueEntry.EstimatedWaitTime ?? 0,
        StatusMessage = BuildStatusMessage(queueEntry.Status, queueEntry.EstimatedWaitTime ?? 0),
        ConsultationDuration = queueEntry.ConsultationDuration,
        AiPrediction = "Prediction pending"
    };
}

    //==========================================================
    // CALL NEXT PATIENT
    //==========================================================
    public async Task<QueueResponseDto?> CallNextPatientAsync()
{
    var nextPatient = await _context.QueueEntries
        .Include(q => q.Appointment)
            .ThenInclude(a => a.Patient)
                .ThenInclude(p => p.User)
        .Include(q => q.Appointment)
            .ThenInclude(a => a.Doctor)
                .ThenInclude(d => d.Department)
        .Where(q => q.Status == "Waiting")
        .OrderBy(q => q.QueueNumber)
        .FirstOrDefaultAsync();

    if (nextPatient == null)
        return null;

    var consultationMinutes = nextPatient.Appointment.Doctor?.AverageConsultationTime ?? 15;
    var appointmentDate = nextPatient.Appointment.AppointmentDate;
    var doctorId = nextPatient.Appointment.DoctorId;

    // Mark current patient as serving
    nextPatient.Status = "Serving";
    nextPatient.ServiceStart = DateTime.UtcNow;
    nextPatient.CurrentPosition = 0;
    nextPatient.EstimatedWaitTime = 0;

    await _notificationService.CreateNotificationAsync(
        nextPatient.Appointment.PatientId,
        "Consultation update",
        ServingMessage,
        "Queue");

    var waitingPatients = await _context.QueueEntries
        .Include(q => q.Appointment)
        .Where(q =>
            q.Appointment.DoctorId == doctorId &&
            q.Appointment.AppointmentDate == appointmentDate &&
            q.Status == "Waiting" &&
            q.Id != nextPatient.Id)
        .OrderBy(q => q.QueueNumber)
        .ToListAsync();

    for (int i = 0; i < waitingPatients.Count; i++)
    {
        var patient = waitingPatients[i];
        patient.CurrentPosition = i + 1;
        patient.EstimatedWaitTime = (i + 1) * consultationMinutes;

        try
        {
            await _ollamaService.GeneratePredictionAsync(patient.Id);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Ollama Error: {ex.Message}");
        }
    }

    await _context.SaveChangesAsync();

    try
    {
        await _ollamaService.GeneratePredictionAsync(nextPatient.Id);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Ollama Error: {ex.Message}");
    }

    var patientName =
        $"{nextPatient.Appointment?.Patient?.User?.FirstName ?? ""} {nextPatient.Appointment?.Patient?.User?.LastName ?? ""}".Trim();
    var departmentName = nextPatient.Appointment?.Doctor?.Department?.DepartmentName ?? "";
    var aiPrediction = nextPatient.AiPredictions
        .OrderByDescending(a => a.GeneratedAt)
        .Select(a => a.Explanation)
        .FirstOrDefault();

    return new QueueResponseDto
    {
        QueueId = nextPatient.Id,
        AppointmentId = nextPatient.AppointmentId,
        QueueNumber = nextPatient.QueueNumber,
        PatientName = patientName,
        Department = departmentName,
        AppointmentDate = nextPatient.Appointment?.AppointmentDate ?? DateOnly.FromDateTime(DateTime.Today),
        AppointmentTime = nextPatient.Appointment?.AppointmentTime ?? TimeOnly.MinValue,
        Reason = nextPatient.Appointment?.Reason ?? "",
        Status = nextPatient.Status ?? "Serving",
        CurrentPosition = nextPatient.CurrentPosition ?? 0,
        EstimatedWaitTime = nextPatient.EstimatedWaitTime ?? 0,
        StatusMessage = BuildStatusMessage(nextPatient.Status, nextPatient.EstimatedWaitTime ?? 0),
        ConsultationDuration = nextPatient.ConsultationDuration,
        AiPrediction = aiPrediction
    };
}

//==========================================================
// COMPLETE CONSULTATION
//==========================================================
public async Task<bool> CompleteConsultationAsync(int queueId)
{
    var queueEntry = await _context.QueueEntries
        .Include(q => q.Appointment)
        .FirstOrDefaultAsync(q => q.Id == queueId);

    if (queueEntry == null)
        return false;

    if (queueEntry.Status != "Serving")
        return false;

    queueEntry.Status = "Completed";
    queueEntry.ServiceEnd = DateTime.UtcNow;

    // Calculate consultation duration
    if (queueEntry.ServiceStart.HasValue)
    {
        queueEntry.ConsultationDuration =
            (int)(queueEntry.ServiceEnd.Value -
                  queueEntry.ServiceStart.Value).TotalMinutes;
    }

    // Calculate actual waiting time
    if (queueEntry.CheckInTime.HasValue &&
        queueEntry.ServiceStart.HasValue)
    {
        queueEntry.ActualWaitTime =
            (int)(queueEntry.ServiceStart.Value -
                  queueEntry.CheckInTime.Value).TotalMinutes;
    }

    await _context.SaveChangesAsync();

    // Update AI predictions for remaining patients
    var remainingPatients = await _context.QueueEntries
        .Where(q => q.Status == "Waiting")
        .ToListAsync();

    foreach (var patient in remainingPatients)
    {
        try
        {
            await _ollamaService.GeneratePredictionAsync(patient.Id);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Ollama Error: {ex.Message}");
        }
    }

    return true;
}

//==========================================================
// TODAY'S QUEUE
//==========================================================
public async Task<List<DoctorQueueDto>> GetTodayQueueAsync(int doctorId)
{
    var today = DateOnly.FromDateTime(DateTime.Today);

    var queue = await _context.QueueEntries
        .Include(q => q.Appointment)
            .ThenInclude(a => a.Patient)
                .ThenInclude(p => p.User)
        .Include(q => q.Appointment)
            .ThenInclude(a => a.Doctor)
                .ThenInclude(d => d.Department)
        .Include(q => q.AiPredictions)
        .Where(q =>
            q.Appointment.DoctorId == doctorId &&
            q.Appointment.AppointmentDate == today &&
            q.Status != "Completed")
        .OrderBy(q => q.QueueNumber)
        .Select(q => new DoctorQueueDto
        {
            QueueId = q.Id,
            AppointmentId = q.AppointmentId,
            QueueNumber = q.QueueNumber,

            PatientName =
                q.Appointment.Patient.User.FirstName + " " +
                q.Appointment.Patient.User.LastName,

            Department =
                q.Appointment.Doctor.Department.DepartmentName ?? "",

            AppointmentDate =
                q.Appointment.AppointmentDate,

            AppointmentTime =
                q.Appointment.AppointmentTime,

            Reason =
                q.Appointment.Reason ?? "",

            Status =
                q.Status ?? "",

            CurrentPosition =
                q.CurrentPosition ?? 0,

            EstimatedWaitTime =
                q.EstimatedWaitTime ?? 0,

            ConsultationDuration =
                q.ConsultationDuration,

            AiPrediction =
                q.AiPredictions
                    .OrderByDescending(a => a.GeneratedAt)
                    .Select(a => a.Explanation)
                    .FirstOrDefault() ?? "Prediction pending"
        })
        .ToListAsync();

    return queue;
}

//==========================================================
// CURRENT PATIENT
//==========================================================
public async Task<DoctorQueueDto?> GetCurrentPatientAsync(int doctorId)
{
    var today = DateOnly.FromDateTime(DateTime.Today);

    var currentPatient = await _context.QueueEntries
        .Include(q => q.Appointment)
            .ThenInclude(a => a.Patient)
                .ThenInclude(p => p.User)
        .Include(q => q.Appointment)
            .ThenInclude(a => a.Doctor)
                .ThenInclude(d => d.Department)
        .Include(q => q.AiPredictions)
        .Where(q =>
            q.Appointment.DoctorId == doctorId &&
            q.Appointment.AppointmentDate == today &&
            q.Status == "Serving")
        .Select(q => new DoctorQueueDto
        {
            QueueId = q.Id,
            AppointmentId = q.AppointmentId,
            QueueNumber = q.QueueNumber,
            PatientName = q.Appointment.Patient.User.FirstName + " " + q.Appointment.Patient.User.LastName,
            Department = q.Appointment.Doctor.Department.DepartmentName ?? "",
            AppointmentDate = q.Appointment.AppointmentDate,
            AppointmentTime = q.Appointment.AppointmentTime,
            Reason = q.Appointment.Reason ?? "",
            Status = q.Status ?? "",
            CurrentPosition = q.CurrentPosition ?? 0,
            EstimatedWaitTime = q.EstimatedWaitTime ?? 0,
            ConsultationDuration = q.ConsultationDuration,
            AiPrediction = q.AiPredictions
                .OrderByDescending(a => a.GeneratedAt)
                .Select(a => a.Explanation)
                .FirstOrDefault() ?? "Prediction pending"
        })
        .FirstOrDefaultAsync();

    return currentPatient;
}

//==========================================================
// COMPLETED PATIENTS
//==========================================================
public async Task<List<DoctorQueueDto>> GetCompletedPatientsAsync(int doctorId)
{
    var today = DateOnly.FromDateTime(DateTime.Today);

    return await _context.QueueEntries
        .Include(q => q.Appointment)
            .ThenInclude(a => a.Patient)
                .ThenInclude(p => p.User)
        .Include(q => q.Appointment)
            .ThenInclude(a => a.Doctor)
                .ThenInclude(d => d.Department)
        .Include(q => q.AiPredictions)
        .Where(q =>
            q.Appointment.DoctorId == doctorId &&
            q.Appointment.AppointmentDate == today &&
            q.Status == "Completed")
        .OrderByDescending(q => q.ServiceEnd)
        .Select(q => new DoctorQueueDto
        {
            QueueId = q.Id,
            AppointmentId = q.AppointmentId,
            QueueNumber = q.QueueNumber,
            PatientName = q.Appointment.Patient.User.FirstName + " " + q.Appointment.Patient.User.LastName,
            Department = q.Appointment.Doctor.Department.DepartmentName ?? "",
            AppointmentDate = q.Appointment.AppointmentDate,
            AppointmentTime = q.Appointment.AppointmentTime,
            Reason = q.Appointment.Reason ?? "",
            Status = q.Status ?? "",
            CurrentPosition = q.CurrentPosition ?? 0,
            EstimatedWaitTime = q.EstimatedWaitTime ?? 0,
            ConsultationDuration = q.ConsultationDuration,
            AiPrediction = q.AiPredictions
                .OrderByDescending(a => a.GeneratedAt)
                .Select(a => a.Explanation)
                .FirstOrDefault() ?? "No AI prediction"
        })
        .ToListAsync();
}

//==========================================================
// AI QUEUE SUMMARY
//==========================================================
public async Task<string> GetAiQueueSummaryAsync(int doctorId)
{
    var today = DateOnly.FromDateTime(DateTime.Today);

    var queue = await _context.QueueEntries
        .Include(q => q.Appointment)
            .ThenInclude(a => a.Patient)
                .ThenInclude(p => p.User)
        .Include(q => q.Appointment)
            .ThenInclude(a => a.Doctor)
        .Where(q =>
            q.Appointment.DoctorId == doctorId &&
            q.Appointment.AppointmentDate == today)
        .OrderBy(q => q.QueueNumber)
        .ToListAsync();

    if (!queue.Any())
    {
        return "No patients are scheduled for today.";
    }

    var serving = queue.FirstOrDefault(q => q.Status == "Serving");
    var waiting = queue.Count(q => q.Status == "Waiting");
    var completed = queue.Count(q => q.Status == "Completed");

    string prompt =
$"""
You are an AI assistant helping hospital doctors manage patient queues.

Today's Queue Summary

Total Patients: {queue.Count}
Waiting Patients: {waiting}
Completed Patients: {completed}

Current Patient:
{(serving == null ? "None" :
$"""
Queue Number: {serving.QueueNumber}
Patient: {serving.Appointment.Patient.User.FirstName} {serving.Appointment.Patient.User.LastName}
Reason: {serving.Appointment.Reason}
""")}

Patient List:

{string.Join("\n",
queue.Select(q =>
$"""
Queue #{q.QueueNumber}
Patient: {q.Appointment.Patient.User.FirstName} {q.Appointment.Patient.User.LastName}
Reason: {q.Appointment.Reason}
Status: {q.Status}
Estimated Wait: {q.EstimatedWaitTime} minutes
"""))}

Generate a short professional summary for the doctor.

Mention:
1. Current workload.
2. Any patients still waiting.
3. Patients that may need urgent attention based on their reason.
4. Overall queue status.
""";

    return await _ollamaService.GenerateTextAsync(prompt);
}

//==========================================================
// TODAY'S QUEUE (PATIENT)
//==========================================================
public async Task<List<QueueResponseDto>> GetTodaysQueueAsync()
{
    var today = DateOnly.FromDateTime(DateTime.Today);

    return await _context.QueueEntries
        .Include(q => q.Appointment)
            .ThenInclude(a => a.Patient)
                .ThenInclude(p => p.User)
        .Include(q => q.Appointment)
            .ThenInclude(a => a.Doctor)
                .ThenInclude(d => d.Department)
        .Include(q => q.AiPredictions)
        .Where(q => q.Appointment.AppointmentDate == today)
        .OrderBy(q => q.QueueNumber)
        .Select(q => new QueueResponseDto
        {
            QueueId = q.Id,
            AppointmentId = q.AppointmentId,
            QueueNumber = q.QueueNumber,
            PatientName = q.Appointment.Patient.User.FirstName + " " + q.Appointment.Patient.User.LastName,
            Department = q.Appointment.Doctor.Department.DepartmentName ?? "",
            AppointmentDate = q.Appointment.AppointmentDate,
            AppointmentTime = q.Appointment.AppointmentTime,
            Reason = q.Appointment.Reason ?? "",
            Status = q.Status ?? "",
            CurrentPosition = q.CurrentPosition ?? 0,
            EstimatedWaitTime = q.EstimatedWaitTime ?? 0,
            StatusMessage = BuildStatusMessage(q.Status, q.EstimatedWaitTime ?? 0),
            ConsultationDuration = q.ConsultationDuration,
            AiPrediction = q.AiPredictions
                .OrderByDescending(a => a.GeneratedAt)
                .Select(a => a.Explanation)
                .FirstOrDefault() ?? "Prediction pending"
        })
        .ToListAsync();
}

//==========================================================
// MY QUEUE
//==========================================================
public async Task<QueueResponseDto?> GetMyQueueAsync(int patientId)
{
    var today = DateOnly.FromDateTime(DateTime.Today);

    var queue = await _context.QueueEntries
        .Include(q => q.Appointment)
            .ThenInclude(a => a.Patient)
                .ThenInclude(p => p.User)
        .Include(q => q.Appointment)
            .ThenInclude(a => a.Doctor)
                .ThenInclude(d => d.Department)
        .Include(q => q.AiPredictions)
        .Where(q =>
            q.Appointment.PatientId == patientId &&
            q.Appointment.AppointmentDate == today &&
            q.Status != "Completed")
        .OrderBy(q => q.QueueNumber)
        .Select(q => new QueueResponseDto
        {
            QueueId = q.Id,
            AppointmentId = q.AppointmentId,
            QueueNumber = q.QueueNumber,
            PatientName = q.Appointment.Patient.User.FirstName + " " + q.Appointment.Patient.User.LastName,
            Department = q.Appointment.Doctor.Department.DepartmentName ?? "",
            AppointmentDate = q.Appointment.AppointmentDate,
            AppointmentTime = q.Appointment.AppointmentTime,
            Reason = q.Appointment.Reason ?? "",
            Status = q.Status ?? "",
            CurrentPosition = q.CurrentPosition ?? 0,
            EstimatedWaitTime = q.EstimatedWaitTime ?? 0,
            StatusMessage = BuildStatusMessage(q.Status, q.EstimatedWaitTime ?? 0),
            ConsultationDuration = q.ConsultationDuration,
            AiPrediction = q.AiPredictions
                .OrderByDescending(a => a.GeneratedAt)
                .Select(a => a.Explanation)
                .FirstOrDefault() ?? "Prediction pending"
        })
        .FirstOrDefaultAsync();

    return queue;
}

//==========================================================
// QUEUE SUMMARY
//==========================================================
public async Task<QueueSummaryDto> GetQueueSummaryAsync()
{
    var today = DateOnly.FromDateTime(DateTime.Today);

    var queue = await _context.QueueEntries
        .Include(q => q.Appointment)
        .Where(q => q.Appointment.AppointmentDate == today)
        .ToListAsync();

    int totalPatients = queue.Count;

    int waitingPatients = queue.Count(q => q.Status == "Waiting");

    int servingPatients = queue.Count(q => q.Status == "Serving");

    int completedPatients = queue.Count(q => q.Status == "Completed");

    double averageWaitTime = queue
        .Where(q => q.ActualWaitTime.HasValue)
        .Select(q => q.ActualWaitTime!.Value)
        .DefaultIfEmpty(0)
        .Average();

    double averageConsultationTime = queue
        .Where(q => q.ConsultationDuration.HasValue)
        .Select(q => q.ConsultationDuration!.Value)
        .DefaultIfEmpty(0)
        .Average();

    return new QueueSummaryDto
    {
        TotalPatients = totalPatients,

        WaitingPatients = waitingPatients,

        ServingPatients = servingPatients,

        CompletedPatients = completedPatients,

        AverageWaitTime = (int)Math.Round(averageWaitTime),

        AverageConsultationTime = (int)Math.Round(averageConsultationTime)
    };
}

    //==========================================================
// REGENERATE AI PREDICTION
//==========================================================
public async Task<string> RegeneratePredictionAsync(int queueId)
{
    // Verify the queue entry exists
    var queueEntry = await _context.QueueEntries
        .Include(q => q.Appointment)
            .ThenInclude(a => a.Patient)
                .ThenInclude(p => p.User)
        .Include(q => q.Appointment)
            .ThenInclude(a => a.Doctor)
                .ThenInclude(d => d.Department)
        .Include(q => q.AiPredictions)
        .FirstOrDefaultAsync(q => q.Id == queueId);

    if (queueEntry == null)
        throw new Exception("Queue entry not found.");

    // Generate a fresh AI prediction
    await _ollamaService.GeneratePredictionAsync(queueEntry.Id);

    // Reload the latest prediction from the database
    await _context.Entry(queueEntry)
        .Collection(q => q.AiPredictions)
        .LoadAsync();

    var latestPrediction = queueEntry.AiPredictions
        .OrderByDescending(p => p.GeneratedAt)
        .FirstOrDefault();

    if (latestPrediction == null)
        return "Prediction generated successfully.";

    return latestPrediction.Explanation ?? "Prediction generated successfully.";
}

//==========================================================
// AI PATIENT SUMMARY
//==========================================================
public async Task<PatientSummaryDto?> GetPatientSummaryAsync(int queueId)
{
    var queue = await _context.QueueEntries
        .Include(q => q.Appointment)
            .ThenInclude(a => a.Patient)
                .ThenInclude(p => p.User)
        .Include(q => q.Appointment)
            .ThenInclude(a => a.Doctor)
                .ThenInclude(d => d.User)
        .Include(q => q.Appointment)
            .ThenInclude(a => a.Doctor)
                .ThenInclude(d => d.Department)
        .FirstOrDefaultAsync(q => q.Id == queueId);

    if (queue == null)
        return null;

    // Generate AI summary
    var summary = await _ollamaService.GeneratePatientSummaryAsync(queue.AppointmentId);

    return new PatientSummaryDto
    {
        QueueId = queue.Id,

        AppointmentId = queue.AppointmentId,

        PatientName =
            (queue.Appointment.Patient.User.FirstName ?? "") + " " +
            (queue.Appointment.Patient.User.LastName ?? ""),

        DoctorName =
            (queue.Appointment.Doctor.User.FirstName ?? "") + " " +
            (queue.Appointment.Doctor.User.LastName ?? ""),

        Department =
            queue.Appointment.Doctor.Department.DepartmentName ?? "",

        AppointmentDate =
            queue.Appointment.AppointmentDate,

        AppointmentTime =
            queue.Appointment.AppointmentTime,

        Reason =
            queue.Appointment.Reason ?? "",

        Status =
            queue.Status ?? "",

        AiSummary =
            summary
    };
}
}