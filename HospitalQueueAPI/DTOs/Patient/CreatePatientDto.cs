namespace HospitalQueueAPI.DTOs.Patient;

public class CreatePatientDto
{
    public int? Age { get; set; }

    public DateOnly DateOfBirth { get; set; }

    public string Gender { get; set; } = string.Empty;

    public string Occupation { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public string EmergencyContactName { get; set; } = string.Empty;

    public string EmergencyContactPhone { get; set; } = string.Empty;

    public string BloodGroup { get; set; } = string.Empty;

    public string Allergies { get; set; } = string.Empty;
}