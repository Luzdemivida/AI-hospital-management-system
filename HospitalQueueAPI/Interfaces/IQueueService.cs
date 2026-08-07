using HospitalQueueAPI.DTOs.Doctor;
using HospitalQueueAPI.DTOs.Queue;

namespace HospitalQueueAPI.Interfaces;

public interface IQueueService
{
    // Patient Queue
    Task<QueueResponseDto> GenerateQueueEntryAsync(int appointmentId);

    Task<List<QueueResponseDto>> GetTodaysQueueAsync();

    Task<QueueResponseDto?> GetMyQueueAsync(int patientId);

    Task<QueueSummaryDto> GetQueueSummaryAsync();

    // Doctor Queue
    Task<QueueResponseDto?> CallNextPatientAsync();

    Task<bool> CompleteConsultationAsync(int queueId);

    Task<List<DoctorQueueDto>> GetTodayQueueAsync(int doctorId);

    Task<DoctorQueueDto?> GetCurrentPatientAsync(int doctorId);

    Task<List<DoctorQueueDto>> GetCompletedPatientsAsync(int doctorId);

    // AI
    Task<string> GetAiQueueSummaryAsync(int doctorId);

    Task<string> RegeneratePredictionAsync(int queueId);

    Task<PatientSummaryDto?> GetPatientSummaryAsync(int queueId);
}