using System.Security.Claims;
using HospitalQueueAPI.DTOs.Patient;
using HospitalQueueAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HospitalQueueAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PatientsController : ControllerBase
    {
        private readonly IPatientService _patientService;

        public PatientsController(IPatientService patientService)
        {
            _patientService = patientService;
        }

        private int GetUserId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("Invalid token.");

            return int.Parse(userId);
        }

        [HttpPost]
        public async Task<IActionResult> CreateProfile(CreatePatientDto request)
        {
            var result = await _patientService.CreateProfileAsync(GetUserId(), request);

            if (result == null)
                return BadRequest(new
                {
                    success = false,
                    message = "Patient profile already exists."
                });

            return Ok(new
            {
                success = true,
                message = "Patient profile created successfully.",
                data = result
            });
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var result = await _patientService.GetProfileAsync(GetUserId());

            if (result == null)
                return NotFound(new
                {
                    success = false,
                    message = "Patient profile not found."
                });

            return Ok(result);
        }

        [HttpPut("me")]
        public async Task<IActionResult> UpdateProfile(UpdatePatientDto request)
        {
            var result = await _patientService.UpdateProfileAsync(GetUserId(), request);

            if (result == null)
                return NotFound(new
                {
                    success = false,
                    message = "Patient profile not found."
                });

            return Ok(new
            {
                success = true,
                message = "Profile updated successfully.",
                data = result
            });
        }

        [HttpDelete("me")]
        public async Task<IActionResult> DeleteProfile()
        {
            var deleted = await _patientService.DeleteProfileAsync(GetUserId());

            if (!deleted)
                return NotFound(new
                {
                    success = false,
                    message = "Patient profile not found."
                });

            return Ok(new
            {
                success = true,
                message = "Patient profile deleted successfully."
            });
        }
    }
}