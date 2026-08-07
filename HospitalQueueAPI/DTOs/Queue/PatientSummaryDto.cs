namespace HospitalQueueAPI.DTOs.Queue;

public class PatientSummaryDto
{
    public int QueueId { get; set; }

    public int AppointmentId { get; set; }

    public string PatientName { get; set; } = string.Empty;

    public string DoctorName { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public DateOnly AppointmentDate { get; set; }

    public TimeOnly AppointmentTime { get; set; }

    public string Reason { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string AiSummary { get; set; } = string.Empty;
}