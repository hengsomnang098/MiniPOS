using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using MiniPOS.API.Application.Contracts;
using MiniPOS.API.Application.DTOs.User;
using MiniPOS.API.Common.Constants;
using MiniPOS.API.Common.Results;
using MiniPOS.API.Domain;

public class UserRepository : IUserRepository
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly IMapper _mapper;
    private readonly ILogger<UserRepository> _logger;
    private readonly ApplicationDbContext _context;
    private readonly IMemoryCache _cache;

    // ✅ Inject IMemoryCache
    public UserRepository(
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        IMapper mapper,
        ILogger<UserRepository> logger,
        ApplicationDbContext context,
        IMemoryCache cache)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _mapper = mapper;
        _logger = logger;
        _context = context;
        _cache = cache;
    }
    public async Task<Result<IEnumerable<GetUserDto>>> GetAllAsync()
    {
        // ✅ Try to get from cache first
        try
        {
            if (_cache.TryGetValue("all_users", out IEnumerable<GetUserDto> cachedUsers))
            {
                return Result<IEnumerable<GetUserDto>>.Success(cachedUsers);
            }

            // Otherwise fetch from DB
            var users = await _context.Users
                .AsNoTracking()
                .ProjectTo<GetUserDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            // ✅ Cache results for 5 minutes
            _cache.Set("all_users", users, new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
            });

            return Result<IEnumerable<GetUserDto>>.Success(users);
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving all users");
            return Result<IEnumerable<GetUserDto>>.Failure(new Error(ErrorCodes.Failure, "An unexpected error occurred while retrieving users."));
        }
    }

    public async Task<Result<GetUserDto>> GetByIdAsync(Guid id)
    {
        var user = await _context.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .Where(u => u.Id == id)
            .ProjectTo<GetUserDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();

        return user != null
            ? Result<GetUserDto>.Success(user)
            : Result<GetUserDto>.Failure(new Error(ErrorCodes.NotFound, "User not found."));
    }

    // ✅ Create user with cached roles
    public async Task<Result<GetUserDto>> CreateUserAsync(CreateUserDto request, string createdBy)
    {
        try
        {
            // 🧠 Try to get roles from cache first
            var roles = await GetCachedRolesAsync();
            var role = roles.FirstOrDefault(r => r.Id == request.RoleId);
            if (role == null)
            {
                return Result<GetUserDto>.Failure(
                    new Error(ErrorCodes.Validation, $"Role with id '{request.RoleId}' not found."));
            }

            // ✅ Check if email already exists
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return Result<GetUserDto>.Failure(
                    new Error(ErrorCodes.Conflict, $"User with email '{request.Email}' already exists."));
            }

            // ✅ Map CreateUserDto → ApplicationUser
            var user = _mapper.Map<ApplicationUser>(request);
            user.UserName = request.Email;
            user.EmailConfirmed = true;
            user.RoleId = role.Id;

            // ✅ Create the user
            var createResult = await _userManager.CreateAsync(user, request.Password);
            if (!createResult.Succeeded)
            {
                var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
                return Result<GetUserDto>.Failure(new Error(ErrorCodes.Validation, errors));
            }

            // ✅ Attach role navigation (for return DTO)
            user.Role = role;

            // ✅ Map to DTO and fill metadata
            var dto = _mapper.Map<GetUserDto>(user);
            dto.RoleId = role.Id;
            dto.Role = role.Name;

            // Optional: clear cached user list
            _cache.Remove("all_users");

            return Result<GetUserDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user {Email}", request.Email);
            return Result<GetUserDto>.Failure(new Error(ErrorCodes.Failure, "An unexpected error occurred while creating the user."));
        }
    }

    public async Task<Result> DeleteAsync(Guid id)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user.RoleId == Guid.Parse("11111111-1111-1111-1111-111111111111")) // Super Admin Role Id
            {
                _logger.LogWarning("Attempt to delete Super Admin user with ID {RoleId}", user.RoleId);
                return Result.Failure(new Error(ErrorCodes.Validation, "Cannot delete Super Admin user."));
            }
            if (user == null)
            {
                return Result.NotFound(new Error(ErrorCodes.NotFound, "User not found."));
            }

            var deleteResult = await _userManager.DeleteAsync(user);
            if (!deleteResult.Succeeded)
            {
                var errors = string.Join("; ", deleteResult.Errors.Select(e => e.Description));
                return Result.Failure(new Error(ErrorCodes.Failure, errors));
            }

            // ✅ Invalidate cache
            _cache.Remove("all_users");

            return Result.Success();
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting user {UserId}", id);
            return Result.Failure(new Error(ErrorCodes.Failure, "An unexpected error occurred while deleting the user."));
        }
    }



    public async Task<Result<GetUserDto>> UpdateUserAsync(UpdateUserDto request, Guid id)
    {
        try
        {
            if (id != request.Id)
            {
                return Result<GetUserDto>.Failure(new Error(ErrorCodes.Validation, "ID mismatch between route and body."));
            }

            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
            {
                return Result<GetUserDto>.Failure(new Error(ErrorCodes.NotFound, "User not found."));
            }

            // Update user properties
            _mapper.Map(request, user);

            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
            {
                var errors = string.Join("; ", updateResult.Errors.Select(e => e.Description));
                return Result<GetUserDto>.Failure(new Error(ErrorCodes.Validation, errors));
            }

            // Reload role from cache
            var roles = await GetCachedRolesAsync();
            var role = roles.FirstOrDefault(r => r.Id == user.RoleId);
            user.Role = role;

            var dto = _mapper.Map<GetUserDto>(user);
            dto.RoleId = role.Id;
            dto.Role = role.Name;

            // ✅ Invalidate cached users (since data changed)
            _cache.Remove("all_users");

            return Result<GetUserDto>.Success(dto);
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating user {UserId}", id);
            return Result<GetUserDto>.Failure(new Error(ErrorCodes.Failure, "An unexpected error occurred while updating the user."));
        }
    }

    // ✅ Private helper: get cached roles
    private async Task<List<ApplicationRole>> GetCachedRolesAsync()
    {
        if (_cache.TryGetValue("roles", out List<ApplicationRole> cachedRoles))
        {
            return cachedRoles;
        }

        var roles = await _roleManager.Roles.AsNoTracking().ToListAsync();

        _cache.Set("roles", roles, new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
        });

        return roles;
    }
}
