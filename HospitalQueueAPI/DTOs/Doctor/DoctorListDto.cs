namespace HospitalQueueAPI.DTOs.Doctor;

public class DoctorListDto
{
    public int DoctorId { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public string Specialization { get; set; } = string.Empty;

    public string Biography { get; set; } = string.Empty;
}
