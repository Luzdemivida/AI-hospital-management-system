using System;
using System.Collections.Generic;

namespace HospitalQueueAPI.Models;

public partial class QueueEntry
{
    public int Id { get; set; }

    public int AppointmentId { get; set; }

    public int QueueNumber { get; set; }

    public int? CurrentPosition { get; set; }

    public int? EstimatedWaitTime { get; set; }

    public int? ActualWaitTime { get; set; }

    public int? ConsultationDuration { get; set; }

    public DateTime? CheckInTime { get; set; }

    public DateTime? ServiceStart { get; set; }

    public DateTime? ServiceEnd { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<AiPrediction> AiPredictions { get; set; } = new List<AiPrediction>();

    public virtual Appointment Appointment { get; set; } = null!;
}
