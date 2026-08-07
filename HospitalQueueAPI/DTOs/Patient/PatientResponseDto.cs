namespace HospitalQueueAPI.DTOs.Patient;

public class PatientResponseDto
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string FullName { get; set; } = string.Empty;

    public DateOnly DateOfBirth { get; set; }

    public string Gender { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public string BloodGroup { get; set; } = string.Empty;

    public string Allergies { get; set; } = string.Empty;
}