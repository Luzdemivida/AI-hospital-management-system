using System.ComponentModel.DataAnnotations;

namespace HospitalQueueAPI.DTOs.Appointment;

public class CreateAppointmentDto : IValidatableObject
{
    [Range(1, int.MaxValue, ErrorMessage = "DoctorId must be a positive integer.")]
    public int DoctorId { get; set; }

    [Required(ErrorMessage = "AppointmentDate is required.")]
    public DateTime? AppointmentDate { get; set; }

    [Required(ErrorMessage = "Reason is required.")]
    [StringLength(500, MinimumLength = 5, ErrorMessage = "Reason must be between 5 and 500 characters.")]
    public string? Reason { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (AppointmentDate.HasValue && AppointmentDate.Value < DateTime.UtcNow)
        {
            yield return new ValidationResult(
                "AppointmentDate must be in the future.",
                new[] { nameof(AppointmentDate) });
        }
    }
}