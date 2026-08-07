using System;
using System.Collections.Generic;

namespace HospitalQueueAPI.Models;

public partial class Appointment
{
    public int Id { get; set; }

    public int PatientId { get; set; }

    public int DoctorId { get; set; }

    public DateOnly AppointmentDate { get; set; }

    public TimeOnly AppointmentTime { get; set; }

    public string? Reason { get; set; }

    public string? BookingType { get; set; }

    public string? Priority { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Doctor Doctor { get; set; } = null!;

    public virtual Patient Patient { get; set; } = null!;

    public virtual ICollection<QueueEntry> QueueEntries { get; set; } = new List<QueueEntry>();
}