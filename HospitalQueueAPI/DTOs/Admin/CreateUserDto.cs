namespace HospitalQueueAPI.DTOs.Admin;

/// <summary>
/// Payload used by an Admin to create a Doctor or Admin account.
/// Public self-registration is restricted to Patient role only.
/// </summary>
public class CreateUserDto
{
    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    /// <summary>
    /// Allowed values: "Doctor" or "Admin".
    /// </summary>
    public string Role { get; set; } = "Doctor";

    /// <summary>
    /// Temporary password — the user should be asked to change it on first login.
    /// </summary>
    public string Password { get; set; } = string.Empty;
}
