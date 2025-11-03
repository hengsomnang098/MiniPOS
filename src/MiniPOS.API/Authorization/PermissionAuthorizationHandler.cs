using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using MiniPOS.API.Domain;
using Microsoft.Extensions.Logging;

namespace MiniPOS.API.Authorization
{
    public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<PermissionAuthorizationHandler> _logger;

        public PermissionAuthorizationHandler(ApplicationDbContext dbContext, ILogger<PermissionAuthorizationHandler> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        protected override async Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            PermissionRequirement requirement)
        {
            // ✅ 1. Check authentication first
            if (context.User?.Identity?.IsAuthenticated != true)
            {
                _logger.LogWarning("Authorization failed: unauthenticated user.");
                context.Fail(); // -> causes 401 Unauthorized
                return;
            }

            // ✅ 2. Extract user ID claim
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                _logger.LogWarning("Authorization failed: user ID claim missing.");
                context.Fail(); // -> 401 Unauthorized
                return;
            }

            var userId = Guid.Parse(userIdClaim.Value);

            // ✅ 3. Load user’s role ID
            var roleId = await _dbContext.Users
                .Where(u => u.Id == userId)
                .Select(u => u.RoleId)
                .FirstOrDefaultAsync();

            if (roleId == Guid.Empty)
            {
                _logger.LogWarning("Authorization failed: user {UserId} has no role assigned.", userId);
                context.Fail(); // -> 403 Forbidden
                return;
            }

            // ✅ 4. Check if that role has the required permission
            var hasPermission = await _dbContext.RolePermissions
                .Include(rp => rp.Permission)
                .AnyAsync(rp => rp.RoleId == roleId && 
                                rp.Permission.Name == requirement.Permission);

            if (hasPermission)
            {
                _logger.LogInformation("✅ Authorization success: user {UserId} has permission {Permission}", userId, requirement.Permission);
                context.Succeed(requirement);
            }
            else
            {
                _logger.LogWarning("🚫 Authorization denied: user {UserId} lacks permission {Permission}", userId, requirement.Permission);
                context.Fail(); // -> 403 Forbidden
            }
        }
    }

    public class PermissionRequirement : IAuthorizationRequirement
    {
        public string Permission { get; }

        public PermissionRequirement(string permission)
        {
            Permission = permission;
        }
    }
}
