using HospitalQueueAPI.Data;
using HospitalQueueAPI.DTOs.Patient;
using HospitalQueueAPI.Interfaces;
using HospitalQueueAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace HospitalQueueAPI.Services
{
    public class PatientService : IPatientService
    {
        private readonly ApplicationDbContext _context;

        public PatientService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PatientResponseDto?> CreateProfileAsync(
            int userId,
            CreatePatientDto request)
        {
            var existing = await _context.Patients
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (existing != null)
                return null;

            var patient = new Patient
            {
                UserId = userId,
                DateOfBirth = request.DateOfBirth,
                Gender = request.Gender,
                Address = request.Address,
                EmergencyContactName = request.EmergencyContactName,
                EmergencyContactPhone = request.EmergencyContactPhone,
                BloodGroup = request.BloodGroup,
                Allergies = request.Allergies,
                CreatedAt = DateTime.UtcNow
            };

            _context.Patients.Add(patient);

            await _context.SaveChangesAsync();

            var user = await _context.Users.FindAsync(userId);

            return new PatientResponseDto
            {
                UserId = patient.UserId,
                FullName = $"{user!.FirstName} {user.LastName}",
                DateOfBirth = patient.DateOfBirth ?? default,
                Gender = patient.Gender ?? "",
                Address = patient.Address ?? "",
                BloodGroup = patient.BloodGroup ?? "",
                Allergies = patient.Allergies ?? ""
            };
        }

        public async Task<PatientResponseDto?> GetProfileAsync(int userId)
        {
            var patient = await _context.Patients
                .Include(x => x.User)
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (patient == null)
                return null;

            return new PatientResponseDto
            {
                UserId = patient.UserId,
                FullName = $"{patient.User.FirstName} {patient.User.LastName}",
                DateOfBirth = patient.DateOfBirth ?? default,
                Gender = patient.Gender ?? "",
                Address = patient.Address ?? "",
                BloodGroup = patient.BloodGroup ?? "",
                Allergies = patient.Allergies ?? ""
            };
        }

        public async Task<PatientResponseDto?> UpdateProfileAsync(
            int userId,
            UpdatePatientDto request)
        {
            var patient = await _context.Patients
                .Include(x => x.User)
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (patient == null)
                return null;

            patient.Address = request.Address;
            patient.EmergencyContactName = request.EmergencyContactName;
            patient.EmergencyContactPhone = request.EmergencyContactPhone;
            patient.BloodGroup = request.BloodGroup;
            patient.Allergies = request.Allergies;

            await _context.SaveChangesAsync();

            return new PatientResponseDto
            {
                UserId = patient.UserId,
                FullName = $"{patient.User.FirstName} {patient.User.LastName}",
                DateOfBirth = patient.DateOfBirth ?? default,
                Gender = patient.Gender ?? "",
                Address = patient.Address ?? "",
                BloodGroup = patient.BloodGroup ?? "",
                Allergies = patient.Allergies ?? ""
            };
        }

        public async Task<bool> DeleteProfileAsync(int userId)
        {
            var patient = await _context.Patients
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (patient == null)
                return false;

            _context.Patients.Remove(patient);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}