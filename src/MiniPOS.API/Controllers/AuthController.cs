using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MiniPOS.API.Application.Contracts;
using MiniPOS.API.Application.DTOs.Auth;
using MiniPOS.API.Controllers;
using MiniPOS.API.Common.Constants;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class AuthController(IAuthRepository authRepository) : BaseApiController
{
    [HttpPost("login")]
    [EnableRateLimiting(RateLimitingConstants.FixedPolicy)]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginUserDto dto)
    {
        var result = await authRepository.LoginAsync(dto);
        return ToActionResult(result);
    }

    [HttpPost("refresh")]
    [EnableRateLimiting(RateLimitingConstants.FixedPolicy)]
    public async Task<ActionResult<AuthResponseDto>> Refresh([FromBody] string refreshToken)
    {
        var result = await authRepository.RefreshTokenAsync(refreshToken);
        return ToActionResult(result);
    }
}
