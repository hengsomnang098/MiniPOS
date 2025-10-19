using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using MiniPOS.Application.Interfaces;
using MiniPOS.Constants;
using MiniPOS.Data;
using MiniPOS.DTOs.Auth;
using MiniPOS.Results;
using Microsoft.EntityFrameworkCore;

namespace MiniPOS.Application.Repositories
{
    public class AuthRepository(
        UserManager<ApplicationUser> userManager,
        IConfiguration configuration
    ) : IAuthRepository
    {
        public async Task<Result<AuthResponseDto>> LoginAsync(LoginUserDto loginUserDto)
        {
            var user = await userManager.Users
                .Include(u => u.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(u => u.Email == loginUserDto.Email);

            if (user == null)
                return Result<AuthResponseDto>.Failure(new Error(ErrorCodes.BadRequest, "Invalid credentials"));

            var valid = await userManager.CheckPasswordAsync(user, loginUserDto.Password);
            if (!valid)
                return Result<AuthResponseDto>.Failure(new Error(ErrorCodes.BadRequest, "Invalid credentials"));

            // ✅ 1. Get the role name directly
            var roles = new List<string>();
            if (user.Role != null)
                roles.Add(user.Role.Name!);

            // ✅ 2. Get all permissions from role
            var permissions = user.Role?.RolePermissions
                .Select(rp => rp.Permission.Name)
                .Distinct()
                .ToList() ?? new List<string>();

            // ✅ 3. Generate token
            var jwtSettings = configuration.GetSection("JwtSettings");
            var token = GenerateJwtToken(user, roles, permissions, jwtSettings);
            var refreshToken = Guid.NewGuid().ToString();

            var response = new AuthResponseDto
            {
                AccessToken = token,
                RefreshToken = refreshToken,
                ExpiresIn = DateTime.UtcNow.AddMinutes(Convert.ToDouble(jwtSettings["DurationInMinutes"])),
                User = new UserInfoDto
                {
                    Id = user.Id,
                    Email = user.Email ?? "",
                    FullName = user.FullName ?? "",
                    Roles = roles,
                    Permissions = permissions
                }
            };

            return Result<AuthResponseDto>.Success(response);
        }

        private static string GenerateJwtToken(
            ApplicationUser user,
            IEnumerable<string> roles,
            IEnumerable<string> permissions,
            IConfigurationSection jwtSettings)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
                new Claim(ClaimTypes.Name, user.UserName ?? "")
            };

            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
            claims.AddRange(permissions.Select(p => new Claim("permission", p)));

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(jwtSettings["DurationInMinutes"])),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public Task<Result<AuthResponseDto>> RefreshTokenAsync(string refreshToken)
        {
            // Example: validate from DB if you store refresh tokens.
            // For now, just simulate a failure if token is missing.
            if (string.IsNullOrWhiteSpace(refreshToken))
                return Task.FromResult(Result<AuthResponseDto>.Failure(new Error(ErrorCodes.BadRequest, "Invalid refresh token")));

            return Task.FromResult(Result<AuthResponseDto>.Failure(new Error(ErrorCodes.BadRequest, "Not implemented yet")));
        }
    }
}
