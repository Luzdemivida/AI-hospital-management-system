using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using HospitalQueueAPI.Data;
using HospitalQueueAPI.Interfaces;
using HospitalQueueAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace HospitalQueueAPI.Services;

public class OllamaService : IOllamaService
{
    private readonly HttpClient _httpClient;
    private readonly ApplicationDbContext _context;

    public OllamaService(
        HttpClient httpClient,
        ApplicationDbContext context)
    {
        _httpClient = httpClient;
        _context = context;
    }

    // ===========================================================
    // Generate AI Wait Time Prediction
    // ===========================================================
    public async Task GeneratePredictionAsync(int queueEntryId)
    {
        var queue = await _context.QueueEntries
            .Include(q => q.Appointment)
                .ThenInclude(a => a.Patient)
                    .ThenInclude(p => p.User)
            .Include(q => q.Appointment)
                .ThenInclude(a => a.Doctor)
            .FirstOrDefaultAsync(q => q.Id == queueEntryId);

        if (queue == null)
            return;

        int waitingPatients = await _context.QueueEntries
            .CountAsync(q =>
                q.Status == "Waiting" &&
                q.Appointment.DoctorId == queue.Appointment.DoctorId);

        int averageConsultation =
            queue.Appointment.Doctor?.AverageConsultationTime ?? 15;

        int predictedWait =
            waitingPatients * averageConsultation;

        string prompt =
$"""
You are an AI hospital assistant.

Patient Queue Number: {queue.QueueNumber}

Patients Waiting:
{waitingPatients}

Average Consultation:
{averageConsultation} minutes

Predicted Wait:
{predictedWait} minutes

Explain the wait time in one professional sentence.
""";

        string explanation = await GenerateTextAsync(prompt);

        var prediction = await _context.AiPredictions
            .FirstOrDefaultAsync(p => p.QueueEntryId == queue.Id);

        if (prediction == null)
        {
            prediction = new AiPrediction
            {
                QueueEntryId = queue.Id
            };

            _context.AiPredictions.Add(prediction);
        }

        prediction.PredictedWaitTime = predictedWait;
        prediction.ConfidenceScore = 0.95m;
        prediction.Explanation = explanation;
        prediction.GeneratedAt = DateTime.UtcNow;

        queue.EstimatedWaitTime = predictedWait;

        await _context.SaveChangesAsync();
    }

    // ===========================================================
    // Generate Patient Summary
    // ===========================================================
    public async Task<string> GeneratePatientSummaryAsync(int appointmentId)
    {
        var appointment = await _context.Appointments
            .Include(a => a.Patient)
                .ThenInclude(p => p.User)
            .Include(a => a.Doctor)
                .ThenInclude(d => d.User)
            .FirstOrDefaultAsync(a => a.Id == appointmentId);

        if (appointment == null)
            return "";

        string prompt =
$"""
Summarize the following patient.

Patient:
{appointment.Patient.User.FirstName}
{appointment.Patient.User.LastName}

Reason:
{appointment.Reason}

Return a professional medical summary in one paragraph.
""";

        return await GenerateTextAsync(prompt);
    }

    // ===========================================================
    // Generic AI Text Generator
    // ===========================================================
    public async Task<string> GenerateTextAsync(string prompt)
    {
        var request = new
        {
            model = "mistral",
            prompt = prompt,
            stream = false
        };

        var response = await _httpClient.PostAsJsonAsync(
            "http://localhost:11434/api/generate",
            request);

        response.EnsureSuccessStatusCode();

        var result =
            await response.Content.ReadFromJsonAsync<OllamaResponse>();

        return result?.Response ?? "";
    }

    // ===========================================================
    // Ask Ollama
    // ===========================================================
    public async Task<string> AskAsync(string prompt)
    {
        return await GenerateTextAsync(prompt);
    }
}