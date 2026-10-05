namespace HospitalQueueAPI.DTOs.Patient;

public class PatientResponseDto
{
    public int Id { get; set; }

    public int UserId { get; set; }

    // User account fields (from User table)
    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    // Patient profile fields (from Patient table)
    public int? Age { get; set; }

    public DateOnly DateOfBirth { get; set; }

    public string Gender { get; set; } = string.Empty;

    public string Occupation { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public string BloodGroup { get; set; } = string.Empty;

    public string Allergies { get; set; } = string.Empty;

    public string EmergencyContactName { get; set; } = string.Empty;

    public string EmergencyContactPhone { get; set; } = string.Empty;
}