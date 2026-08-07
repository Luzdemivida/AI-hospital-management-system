using BCrypt.Net;
using HospitalQueueAPI.Data;
using HospitalQueueAPI.DTOs.Auth;
using HospitalQueueAPI.Interfaces;
using HospitalQueueAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace HospitalQueueAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtService _jwtService;

        public AuthService(
            ApplicationDbContext context,
            JwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            // Normalize input
            string email = request.Email.Trim().ToLowerInvariant();

            string role = request.Role.Trim().ToUpperInvariant() switch
            {
                "PATIENT" => "Patient",
                "DOCTOR" => "Doctor",
                "ADMIN" => "Admin",
                _ => "Patient"
            };

            // Check if email already exists
            bool exists = await _context.Users
                .AnyAsync(u => u.Email.ToLower() == email);

            if (exists)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Email already exists."
                };
            }

            var user = new User
            {
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Email = email,
                Phone = string.IsNullOrWhiteSpace(request.Phone)
                    ? null
                    : request.Phone.Trim(),

                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),

                Role = role,

                Status = "Active",

                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);

            await _context.SaveChangesAsync();

            var token = _jwtService.GenerateToken(user);

            return new AuthResponse
            {
                Success = true,
                Message = "Registration successful.",
                Token = token,
                RefreshToken = "",
                Expires = DateTime.UtcNow.AddHours(12)
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            string email = request.Email.Trim().ToLowerInvariant();

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email);

            if (user == null)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Invalid email or password."
                };
            }

            bool validPassword = BCrypt.Net.BCrypt.Verify(
                request.Password,
                user.PasswordHash);

            if (!validPassword)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Invalid email or password."
                };
            }

            var token = _jwtService.GenerateToken(user);

            return new AuthResponse
            {
                Success = true,
                Message = "Login successful.",
                Token = token,
                RefreshToken = "",
                Expires = DateTime.UtcNow.AddHours(12)
            };
        }
    }
}