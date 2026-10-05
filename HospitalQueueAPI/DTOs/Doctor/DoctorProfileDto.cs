namespace HospitalQueueAPI.DTOs.Doctor;

/// <summary>Returned by GET /Doctor/profile</summary>
public class DoctorProfileDto
{
    public int UserId { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string? Specialization { get; set; }

    public string? Department { get; set; }

    public int? ExperienceYears { get; set; }

    public int? AverageConsultationTime { get; set; }

    public string? LicenseNumber { get; set; }

    public decimal? ConsultationFee { get; set; }

    public string? Biography { get; set; }

    public DateTime? CreatedAt { get; set; }
}

/// <summary>Sent by PUT /Doctor/profile</summary>
public class UpdateDoctorProfileDto
{
    public string? Specialization { get; set; }

    public int? ExperienceYears { get; set; }

    public int? AverageConsultationTime { get; set; }

    public string? LicenseNumber { get; set; }

    public decimal? ConsultationFee { get; set; }

    public string? Biography { get; set; }
}
