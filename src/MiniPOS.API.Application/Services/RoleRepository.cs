using Microsoft.EntityFrameworkCore;
using MiniPOS.API.Application.Contracts;
using MiniPOS.API.Application.DTOs.Role;
using MiniPOS.API.Common.Results;
using MiniPOS.API.Common.Constants;
using MiniPOS.API.Domain;
using AutoMapper;
using AutoMapper.QueryableExtensions;

namespace MiniPOS.API.Application.Services
{
    public class RoleRepository : IRoleRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public RoleRepository(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<Result<List<GetRoleDto>>> GetAllAsync()
        {
            var roles = await _context.Roles
                .AsNoTracking()
                .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
                .ProjectTo<GetRoleDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            return Result<List<GetRoleDto>>.Success(roles);
        }

        public async Task<Result<GetRoleDto>> GetByIdAsync(Guid id)
        {
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

        public async Task<Result<GetRoleDto>> CreateAsync(CreateRoleDto createDto)
        {
            // Validate permissions exist
            var permissions = await _context.Permissions
                .Where(p => createDto.PermissionIds.Contains(p.Id))
                .ToListAsync();
            

            if (permissions.Count != createDto.PermissionIds.Count())
                return Result<GetRoleDto>.Failure(new Error(ErrorCodes.BadRequest, "One or more permission IDs are invalid"));

            // Create role
            var role = _mapper.Map<ApplicationRole>(createDto);
            role.NormalizedName = createDto.Name.ToUpper();

            await _context.Roles.AddAsync(role);

            // Create role permissions
            var rolePermissions = createDto.PermissionIds.Select(pid => new RolePermission
            {
                RoleId = role.Id,
                PermissionId = pid
            }).ToList();

            await _context.RolePermissions.AddRangeAsync(rolePermissions);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return Result<GetRoleDto>.Failure(new Error(ErrorCodes.BadRequest, "Role name already exists"));
            }

            // Map and return created role with permissions
            var roleWithPermissions = await _context.Roles
                .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(r => r.Id == role.Id);

            var result = _mapper.Map<GetRoleDto>(roleWithPermissions);

            return Result<GetRoleDto>.Success(result);
        }

        public async Task<Result<GetRoleDto>> UpdateAsync(Guid id, UpdateRoleDto updateDto)
        {
            var role = await _context.Roles
                .Include(r => r.RolePermissions)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (role == null)
                return Result<GetRoleDto>.Failure(new Error(ErrorCodes.NotFound, "Role not found"));

            // Validate permissions exist
            var permissions = await _context.Permissions
                .Where(p => updateDto.PermissionIds.Contains(p.Id))
                .ToListAsync();

            if (permissions.Count != updateDto.PermissionIds.Count())
                return Result<GetRoleDto>.Failure(new Error(ErrorCodes.BadRequest, "One or more permission IDs are invalid"));

            // Update role
            _mapper.Map(updateDto, role);

            // Update role permissions
            _context.RolePermissions.RemoveRange(role.RolePermissions);
            
            var rolePermissions = updateDto.PermissionIds.Select(pid => new RolePermission
            {
                RoleId = role.Id,
                PermissionId = pid
            }).ToList();

            await _context.RolePermissions.AddRangeAsync(rolePermissions);

            await _context.SaveChangesAsync();

            // Map and return updated role with permissions
            var roleWithPermissions = await _context.Roles
                .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(r => r.Id == role.Id);

            var result = _mapper.Map<GetRoleDto>(roleWithPermissions);

            return Result<GetRoleDto>.Success(result);
        }

        public async Task<Result<bool>> DeleteAsync(Guid id)
        {
            var role = await _context.Roles
                .Include(r => r.Users)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (role == null)
                return Result<bool>.Failure(new Error(ErrorCodes.NotFound, "Role not found"));

            if (role.Users.Any())
                return Result<bool>.Failure(new Error(ErrorCodes.BadRequest, "Cannot delete role with assigned users"));

            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();

            return Result<bool>.Success(true);
        }

        public async Task<Result<List<PermissionDto>>> GetAvailablePermissionsAsync()
        {
            var permissions = await _context.Permissions
                .AsNoTracking()
                .ProjectTo<PermissionDto>(_mapper.ConfigurationProvider)
                .OrderBy(p => p.Name)
                .ToListAsync();

            return Result<List<PermissionDto>>.Success(permissions);
        }

        public async Task<Result<List<PermissionDto>>> GetRolePermissionsAsync(Guid id)
        {
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Id == id);
            if (role == null)
                return Result<List<PermissionDto>>.Failure(new Error(ErrorCodes.NotFound, "Role not found"));

            var permissions = await _context.RolePermissions
                .Include(rp => rp.Permission)
                .Where(rp => rp.RoleId == id)
                .Select(rp => rp.Permission)
                .ProjectTo<PermissionDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            return Result<List<PermissionDto>>.Success(permissions);
        }
    }
}