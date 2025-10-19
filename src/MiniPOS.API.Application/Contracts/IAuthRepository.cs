

using MiniPOS.API.Application.DTOs.Auth;
using MiniPOS.API.Common.Results;

namespace MiniPOS.API.Application.Contracts
{
    public interface IAuthRepository
    {
        Task<Result<AuthResponseDto>> LoginAsync(LoginUserDto loginDto);
        Task<Result<AuthResponseDto>> RefreshTokenAsync(string refreshToken);
    }
}