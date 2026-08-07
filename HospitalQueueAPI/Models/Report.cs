using System;
using System.Collections.Generic;

namespace HospitalQueueAPI.Models;

public partial class Report
{
    public int Id { get; set; }

    public string ReportName { get; set; } = null!;

    public string ReportType { get; set; } = null!;

    public int? GeneratedBy { get; set; }

    public DateTime? GeneratedAt { get; set; }

    public string? FilePath { get; set; }

    public virtual User? GeneratedByNavigation { get; set; }
}
