namespace HospitalQueueAPI.DTOs.Patient;

public class UpdatePatientDto
{
    public int? Age { get; set; }

    public string Occupation { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public string EmergencyContactName { get; set; } = string.Empty;

    public string EmergencyContactPhone { get; set; } = string.Empty;

    public string BloodGroup { get; set; } = string.Empty;

    public string Allergies { get; set; } = string.Empty;
}