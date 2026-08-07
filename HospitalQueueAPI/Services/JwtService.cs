using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HospitalQueueAPI.Models;
using Microsoft.IdentityModel.Tokens;

namespace HospitalQueueAPI.Services
{
    public class JwtService
    {
        private readonly IConfiguration _configuration;

        public JwtService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(User user)
        {
            var claims = new List<Claim>
            {
                // User ID (used throughout the application)
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),

                // Standard JWT Subject
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),

                // Email
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Email, user.Email),

                // Full Name
                new Claim(
                    ClaimTypes.Name,
                    $"{user.FirstName} {user.LastName}"
                ),

                // User Role
                new Claim(
                    ClaimTypes.Role,
                    user.Role
                )
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!)
            );

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            );

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(12),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}