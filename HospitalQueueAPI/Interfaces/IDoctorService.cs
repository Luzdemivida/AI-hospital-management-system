using HospitalQueueAPI.DTOs.Doctor;

namespace HospitalQueueAPI.Interfaces;

public interface IDoctorService
{
    Task<List<DoctorDashboardDto>> GetTodaysPatientsAsync(int doctorUserId);

    Task<DoctorDashboardDto?> GetCurrentPatientAsync(int doctorUserId);

    Task<List<DoctorDashboardDto>> GetCompletedPatientsAsync(int doctorUserId);
}