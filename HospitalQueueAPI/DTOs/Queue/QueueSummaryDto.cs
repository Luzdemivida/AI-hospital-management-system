namespace HospitalQueueAPI.DTOs.Queue;

public class QueueSummaryDto
{
    public int TotalPatients { get; set; }

    public int WaitingPatients { get; set; }

    public int ServingPatients { get; set; }

    public int CompletedPatients { get; set; }

    public int AverageWaitTime { get; set; }

    public int AverageConsultationTime { get; set; }
}