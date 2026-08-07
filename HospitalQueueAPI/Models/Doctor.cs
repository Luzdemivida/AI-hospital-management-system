using System;
using System.Collections.Generic;

namespace HospitalQueueAPI.Models;

public partial class Doctor
{
    public int UserId { get; set; }

    public int DepartmentId { get; set; }

    public string? Specialization { get; set; }

    public int? ExperienceYears { get; set; }

    public int? AverageConsultationTime { get; set; }

    public string? LicenseNumber { get; set; }

    public decimal? ConsultationFee { get; set; }

    public string? Biography { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

    public virtual Department Department { get; set; } = null!;

    public virtual ICollection<DoctorSchedule> DoctorSchedules { get; set; } = new List<DoctorSchedule>();

    public virtual User User { get; set; } = null!;
}
