using MiniPOS.DTOs.Auth;
using MiniPOS.Results;

namespace MiniPOS.Application.Interfaces
{
    public interface IAuthRepository
    {
        Task<Result<AuthResponseDto>> LoginAsync(LoginUserDto loginDto);
        Task<Result<AuthResponseDto>> RefreshTokenAsync(string refreshToken);
    }
}