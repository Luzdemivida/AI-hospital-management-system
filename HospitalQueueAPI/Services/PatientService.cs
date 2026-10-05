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
                Age = request.Age,
                DateOfBirth = request.DateOfBirth,
                Gender = request.Gender,
                Occupation = request.Occupation,
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
                UserId              = patient.UserId,
                FirstName           = user!.FirstName ?? "",
                LastName            = user.LastName   ?? "",
                FullName            = $"{user.FirstName} {user.LastName}",
                Email               = user.Email      ?? "",
                Phone               = user.Phone      ?? "",
                Age                 = patient.Age,
                DateOfBirth         = patient.DateOfBirth    ?? default,
                Gender              = patient.Gender                  ?? "",
                Occupation          = patient.Occupation              ?? "",
                Address             = patient.Address                 ?? "",
                BloodGroup          = patient.BloodGroup              ?? "",
                Allergies           = patient.Allergies               ?? "",
                EmergencyContactName  = patient.EmergencyContactName  ?? "",
                EmergencyContactPhone = patient.EmergencyContactPhone ?? ""
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
                UserId              = patient.UserId,
                FirstName           = patient.User.FirstName ?? "",
                LastName            = patient.User.LastName  ?? "",
                FullName            = $"{patient.User.FirstName} {patient.User.LastName}",
                Email               = patient.User.Email     ?? "",
                Phone               = patient.User.Phone     ?? "",
                Age                 = patient.Age,
                DateOfBirth         = patient.DateOfBirth    ?? default,
                Gender              = patient.Gender                  ?? "",
                Occupation          = patient.Occupation              ?? "",
                Address             = patient.Address                 ?? "",
                BloodGroup          = patient.BloodGroup              ?? "",
                Allergies           = patient.Allergies               ?? "",
                EmergencyContactName  = patient.EmergencyContactName  ?? "",
                EmergencyContactPhone = patient.EmergencyContactPhone ?? ""
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

            patient.Age = request.Age;
            patient.Occupation = request.Occupation;
            patient.Address = request.Address;
            patient.EmergencyContactName = request.EmergencyContactName;
            patient.EmergencyContactPhone = request.EmergencyContactPhone;
            patient.BloodGroup = request.BloodGroup;
            patient.Allergies = request.Allergies;

            await _context.SaveChangesAsync();

            return new PatientResponseDto
            {
                UserId              = patient.UserId,
                FirstName           = patient.User.FirstName ?? "",
                LastName            = patient.User.LastName  ?? "",
                FullName            = $"{patient.User.FirstName} {patient.User.LastName}",
                Email               = patient.User.Email     ?? "",
                Phone               = patient.User.Phone     ?? "",
                Age                 = patient.Age,
                DateOfBirth         = patient.DateOfBirth    ?? default,
                Gender              = patient.Gender                  ?? "",
                Occupation          = patient.Occupation              ?? "",
                Address             = patient.Address                 ?? "",
                BloodGroup          = patient.BloodGroup              ?? "",
                Allergies           = patient.Allergies               ?? "",
                EmergencyContactName  = patient.EmergencyContactName  ?? "",
                EmergencyContactPhone = patient.EmergencyContactPhone ?? ""
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