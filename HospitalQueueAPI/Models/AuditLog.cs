using System;
using System.Collections.Generic;

namespace HospitalQueueAPI.Models;

public partial class AuditLog
{
    public int Id { get; set; }

    public int? UserId { get; set; }

    public string Action { get; set; } = null!;

    public string? TableName { get; set; }

    public int? RecordId { get; set; }

    public string? IpAddress { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User? User { get; set; }
}
