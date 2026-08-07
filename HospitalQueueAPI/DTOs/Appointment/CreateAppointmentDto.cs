namespace HospitalQueueAPI.DTOs.Appointment;

public class CreateAppointmentDto
{
    public int DoctorId { get; set; }

    public DateTime AppointmentDate { get; set; }

    public string? Reason { get; set; }
}