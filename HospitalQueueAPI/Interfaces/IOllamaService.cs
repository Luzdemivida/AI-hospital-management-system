namespace HospitalQueueAPI.Interfaces;

public interface IOllamaService
{
    Task GeneratePredictionAsync(int queueEntryId);

    Task<string> GeneratePatientSummaryAsync(int appointmentId);

    Task<string> GenerateTextAsync(string prompt);

    Task<string> AskAsync(string prompt);
}