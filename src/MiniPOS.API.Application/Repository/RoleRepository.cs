using Microsoft.EntityFrameworkCore;
using MiniPOS.API.Application.Contracts;
using MiniPOS.API.Application.DTOs.Role;
using MiniPOS.API.Common.Results;
using MiniPOS.API.Common.Constants;
using MiniPOS.API.Domain;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity;

namespace MiniPOS.API.Application.Services
{
    public class RoleRepository : IRoleRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;
        private readonly ILogger<RoleRepository> _logger;
        private readonly RoleManager<ApplicationRole> _roleManager;


        public RoleRepository(
            ApplicationDbContext context,
            IMapper mapper,
            IMemoryCache cache,
            ILogger<RoleRepository> logger,
            RoleManager<ApplicationRole> roleManager)
        {
            _context = context;
            _mapper = mapper;
            _cache = cache;
            _logger = logger;
            _roleManager = roleManager;
        }

        // ✅ Get all roles (cached, no heavy includes)
        public async Task<Result<List<GetRoleDto>>> GetAllAsync()
        {

            _logger.LogInformation("CACHE MISS: Roles fetched from database");

            var roles = await _context.Roles
                .OrderBy(r=>r.CreatedAt)
                .AsNoTracking()
                .ProjectTo<GetRoleDto>(_mapper.ConfigurationProvider)
                .ToListAsync();


            return Result<List<GetRoleDto>>.Success(roles);
        }

        // ✅ Get role by ID (loads permissions)
        public async Task<Result<GetRoleDto>> GetByIdAsync(Guid id)
        {

            _logger.LogInformation("CACHE MISS: Role {RoleId} fetched from database", id);

            var role = await _context.Roles
                .AsNoTracking()
                .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
                .ProjectTo<GetRoleDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (role == null)
                return Result<GetRoleDto>.Failure(new Error(ErrorCodes.NotFound, "Role not found"));

            return Result<GetRoleDto>.Success(role);
        }

        // ✅ Create new role and invalidate cache
        public async Task<Result<GetRoleDto>> CreateAsync(CreateRoleDto createDto)
        {
            try
            {
                var permissions = await _context.Permissions
                    .Where(p => createDto.PermissionIds.Contains(p.Id))
                    .ToListAsync();

                if (permissions.Count != createDto.PermissionIds.Count())
                    return Result<GetRoleDto>.Failure(new Error(ErrorCodes.Validation, "One or more permission IDs are invalid"));

                var role = _mapper.Map<ApplicationRole>(createDto);
                if (role == null)
                    return Result<GetRoleDto>.Failure(new Error(ErrorCodes.Validation, "Invalid role data"));

                role.NormalizedName = createDto.Name.ToUpper();

                await _context.Roles.AddAsync(role);

                var rolePermissions = createDto.PermissionIds.Select(pid => new RolePermission
                {
                    RoleId = role.Id,
                    PermissionId = pid
                }).ToList();

                await _context.RolePermissions.AddRangeAsync(rolePermissions);
                await _context.SaveChangesAsync();

                _logger.LogInformation("CACHE INVALIDATE: Roles cache cleared after new role created");

                var roleWithPermissions = await _context.Roles
                    .AsNoTracking()
                    .Include(r => r.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
                    .FirstOrDefaultAsync(r => r.Id == role.Id);

                var result = _mapper.Map<GetRoleDto>(roleWithPermissions);

                return Result<GetRoleDto>.Success(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating a new role.");
                return Result<GetRoleDto>.Failure(new Error(ErrorCodes.Failure, "An unexpected error occurred while creating the role."));
            }
        }

        // ✅ Update role efficiently
        public async Task<Result<GetRoleDto>> UpdateAsync(Guid id, UpdateRoleDto updateDto)
        {
            try
            {
                var role = await _roleManager.FindByIdAsync(id.ToString());
                if (role == null)
                    return Result<GetRoleDto>.Failure(new Error(ErrorCodes.Validation, "Role not found"));

                var permissions = await _context.Permissions
                    .Where(p => updateDto.PermissionIds.Contains(p.Id))
                    .ToListAsync();

                if (permissions.Count != updateDto.PermissionIds.Count())
                    return Result<GetRoleDto>.Failure(new Error(ErrorCodes.Validation, "One or more permission IDs are invalid"));

                role.Name = updateDto.Name;
                role.Description = updateDto.Description;
                role.NormalizedName = updateDto.Name.ToUpper();

                var identityResult = await _roleManager.UpdateAsync(role);
                if (!identityResult.Succeeded)
                {
                    var errorMsg = string.Join(", ", identityResult.Errors.Select(e => e.Description));
                    _logger.LogWarning("Role update failed via RoleManager: {Errors}", errorMsg);
                    return Result<GetRoleDto>.Failure(new Error(ErrorCodes.Failure, errorMsg));
                }

                var existingPermissions = _context.RolePermissions.Where(rp => rp.RoleId == id);
                _context.RolePermissions.RemoveRange(existingPermissions);

                var newPermissions = updateDto.PermissionIds.Select(pid => new RolePermission
                {
                    RoleId = role.Id,
                    PermissionId = pid
                }).ToList();

                await _context.RolePermissions.AddRangeAsync(newPermissions);
                await _context.SaveChangesAsync();
                _logger.LogInformation("CACHE INVALIDATE: Roles cache cleared after role update");

                var updatedRole = await _context.Roles
                    .AsNoTracking()
                    .Include(r => r.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
                    .FirstOrDefaultAsync(r => r.Id == id);

                var result = _mapper.Map<GetRoleDto>(updatedRole);
                return Result<GetRoleDto>.Success(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating role {RoleId}.", id);
                return Result<GetRoleDto>.Failure(new Error(ErrorCodes.Failure, "An unexpected error occurred while updating the role."));
            }
        }

        // ✅ Delete role (no Include)
        public async Task<Result<bool>> DeleteAsync(Guid id)
        {
            try
            {
                var role = await _context.Roles.FirstOrDefaultAsync(r => r.Id == id);
                if (role == null)
                    return Result<bool>.Failure(new Error(ErrorCodes.NotFound, "Role not found"));

                if (role.Name == "Super Admin")
                    return Result<bool>.Failure(new Error(ErrorCodes.BadRequest, "Cannot delete Super Admin role"));

                bool hasUsers = await _context.UserRoles.AnyAsync(ur => ur.RoleId == id);
                if (hasUsers)
                    return Result<bool>.Failure(new Error(ErrorCodes.BadRequest, "Cannot delete role with assigned users"));

                _context.Roles.Remove(role);
                await _context.SaveChangesAsync();
                _logger.LogInformation("CACHE INVALIDATE: Roles cache cleared after role deletion");

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting role {RoleId}.", id);
                return Result<bool>.Failure(new Error(ErrorCodes.Failure, "An unexpected error occurred while deleting the role."));
            }
        }

        // ✅ Cached available permissions
        public async Task<Result<List<PermissionDto>>> GetAvailablePermissionsAsync()
        {
            try
            {

                _logger.LogInformation("CACHE MISS: Permissions fetched from database");

                var permissions = await _context.Permissions
                    .AsNoTracking()
                    .ProjectTo<PermissionDto>(_mapper.ConfigurationProvider)
                    .OrderBy(p => p.Name)
                    .ToListAsync();

                return Result<List<PermissionDto>>.Success(permissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching available permissions.");
                return Result<List<PermissionDto>>.Failure(new Error(ErrorCodes.Failure, "An unexpected error occurred while fetching permissions."));
            }
        }

        // ✅ Optimized role permissions query (no Include)
        public async Task<Result<List<PermissionDto>>> GetRolePermissionsAsync(Guid id)
        {
            try
            {
                var cacheKey = $"role_permissions_{id}";
                if (_cache.TryGetValue(cacheKey, out List<PermissionDto> cachedRolePermissions))
                {
                    _logger.LogInformation("CACHE HIT: Permissions for Role {RoleId} fetched from memory cache", id);
                    return Result<List<PermissionDto>>.Success(cachedRolePermissions);
                }

                _logger.LogInformation("CACHE MISS: Permissions for Role {RoleId} fetched from database", id);

                var roleExists = await _context.Roles.AnyAsync(r => r.Id == id);
                if (!roleExists)
                    return Result<List<PermissionDto>>.Failure(new Error(ErrorCodes.NotFound, "Role not found"));

                var permissions = await _context.RolePermissions
                    .Where(rp => rp.RoleId == id)
                    .Select(rp => rp.Permission)
                    .ProjectTo<PermissionDto>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                _cache.Set(cacheKey, permissions, TimeSpan.FromMinutes(10));

                return Result<List<PermissionDto>>.Success(permissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching permissions for role {RoleId}.", id);
                return Result<List<PermissionDto>>.Failure(new Error(ErrorCodes.Failure, "An unexpected error occurred while fetching role permissions."));
            }
        }
    }
}
