using System;
using System.Collections.Generic;

namespace HospitalQueueAPI.Models;

public partial class Patient
{
    public int UserId { get; set; }

    public int? Age { get; set; }

    public DateOnly? DateOfBirth { get; set; }

    public string? Occupation { get; set; }

    public string? Gender { get; set; }

    public string? Address { get; set; }

    public string? EmergencyContactName { get; set; }

    public string? EmergencyContactPhone { get; set; }

    public string? BloodGroup { get; set; }

    public string? Allergies { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

    public virtual User User { get; set; } = null!;
}
