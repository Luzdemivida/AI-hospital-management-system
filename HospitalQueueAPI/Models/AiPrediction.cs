using System;
using System.Collections.Generic;

namespace HospitalQueueAPI.Models;

public partial class AiPrediction
{
    public int Id { get; set; }

    public int QueueEntryId { get; set; }

    public int? PredictedWaitTime { get; set; }

    public decimal? ConfidenceScore { get; set; }

    public string? Explanation { get; set; }

    public DateTime? GeneratedAt { get; set; }

    public virtual QueueEntry QueueEntry { get; set; } = null!;
}
