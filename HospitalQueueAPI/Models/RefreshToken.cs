using System;
using System.Collections.Generic;

namespace HospitalQueueAPI.Models;

public partial class RefreshToken
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string Token { get; set; } = null!;

    public DateTime ExpiresAt { get; set; }

    public DateTime? CreatedAt { get; set; }

    public bool? Revoked { get; set; }

    public virtual User User { get; set; } = null!;
}
