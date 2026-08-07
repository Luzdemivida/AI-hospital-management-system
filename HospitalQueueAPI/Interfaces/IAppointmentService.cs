using HospitalQueueAPI.DTOs.Appointment;

namespace HospitalQueueAPI.Interfaces
{
    public interface IAppointmentService
    {
        Task<AppointmentResponseDto?> CreateAppointmentAsync(
            int userId,
            CreateAppointmentDto request);

        Task<List<AppointmentResponseDto>> GetMyAppointmentsAsync(
            int userId);

        Task<bool> CancelAppointmentAsync(
            int appointmentId,
            int userId);
    }
}