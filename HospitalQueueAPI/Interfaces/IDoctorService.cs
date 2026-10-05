using HospitalQueueAPI.DTOs.Doctor;

namespace HospitalQueueAPI.Interfaces;

public interface IDoctorService
{
    Task<List<DoctorDashboardDto>> GetTodaysPatientsAsync(int doctorUserId);

    Task<DoctorDashboardDto?> GetCurrentPatientAsync(int doctorUserId);

    Task<List<DoctorDashboardDto>> GetCompletedPatientsAsync(int doctorUserId);

    Task<List<DoctorListDto>> GetAllDoctorsAsync();

    Task<DoctorProfileDto?> GetProfileAsync(int doctorUserId);

    Task<DoctorProfileDto?> UpdateProfileAsync(int doctorUserId, UpdateDoctorProfileDto request);
}