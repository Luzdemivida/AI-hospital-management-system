using HospitalQueueAPI.DTOs.Auth;

namespace HospitalQueueAPI.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);

    Task<AuthResponse> LoginAsync(LoginRequest request);
}