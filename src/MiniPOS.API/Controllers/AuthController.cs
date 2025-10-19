using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniPOS.Application.Interfaces;
using MiniPOS.Controllers;
using MiniPOS.DTOs.Auth;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class AuthController(IAuthRepository authRepository) : BaseApiController
{
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginUserDto dto)
    {
        var result = await authRepository.LoginAsync(dto);
        return ToActionResult(result);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponseDto>> Refresh([FromBody] string refreshToken)
    {
        var result = await authRepository.RefreshTokenAsync(refreshToken);
        return ToActionResult(result);
    }
}
