namespace HospitalQueueAPI.DTOs.Doctor;

public class DoctorQueueDto
{
    public int QueueId { get; set; }
    public int AppointmentId { get; set; }
    public int QueueNumber { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public DateOnly AppointmentDate { get; set; }
    public TimeOnly AppointmentTime { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int? CurrentPosition { get; set; }
    public int? EstimatedWaitTime { get; set; }
    public int? ConsultationDuration { get; set; }
    public string? AiPrediction { get; set; }
}