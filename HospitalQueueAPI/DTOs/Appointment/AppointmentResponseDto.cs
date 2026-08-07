namespace HospitalQueueAPI.DTOs.Appointment
{
    public class AppointmentResponseDto
    {
        public int AppointmentId { get; set; }

        public string PatientName { get; set; } = string.Empty;

        public string DoctorName { get; set; } = string.Empty;

        public string Department { get; set; } = string.Empty;

        public DateTime AppointmentDate { get; set; }

        public string Status { get; set; } = string.Empty;
    }
}