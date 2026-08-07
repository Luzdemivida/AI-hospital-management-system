namespace HospitalQueueAPI.DTOs.Appointment;

public class AppointmentCreationResult
{
    public bool Success { get; set; }

    public string? ErrorMessage { get; set; }

    public AppointmentResponseDto? Appointment { get; set; }
}
