using HospitalQueueAPI.DTOs.Patient;

namespace HospitalQueueAPI.Interfaces
{
    public interface IPatientService
    {
        Task<PatientResponseDto?> CreateProfileAsync(
            int userId,
            CreatePatientDto request);

        Task<PatientResponseDto?> GetProfileAsync(
            int userId);

        Task<PatientResponseDto?> UpdateProfileAsync(
            int userId,
            UpdatePatientDto request);

        Task<bool> DeleteProfileAsync(
            int userId);
    }
}