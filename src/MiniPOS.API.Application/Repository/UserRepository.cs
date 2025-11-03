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

namespace MiniPOS.API.Application.Services
{
    public class UserRepository : IUserRepository
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly IMapper _mapper;
        private readonly ILogger<UserRepository> _logger;
        private readonly ApplicationDbContext _context;
        private readonly IMemoryCache _cache;

        private const string RolesCacheKey = "cached_roles";

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

        // ✅ Paginated user list with optional search
        public async Task<PaginatedResult<GetUserDto>> GetAllAsync(int page, int pageSize, string search = null)
        {
            try
            {
                page = Math.Max(1, page);
                pageSize = Math.Clamp(pageSize, 1, 100);

                var query = _context.Users.AsNoTracking();

                if (!string.IsNullOrWhiteSpace(search))
                {
                    var normalized = search.Trim().ToLower();
                    query = query.Where(u =>
                        u.FullName.ToLower().Contains(normalized) ||
                        u.Email.ToLower().Contains(normalized) ||
                        (u.Role != null && u.Role.Name.ToLower().Contains(normalized))
                    );
                }

                var totalItems = await query.CountAsync();
                var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

                var users = await query
                    .OrderBy(u => u.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .AsNoTracking()
                    .ProjectTo<GetUserDto>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                return PaginatedResult<GetUserDto>.Success(
                    items: users,
                    pageCount: totalItems,
                    pageNumber: page,
                    pageSize: pageSize,
                    totalPages: totalPages
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving users.");
                return PaginatedResult<GetUserDto>.Failure(
                    new Error(ErrorCodes.Failure, "An unexpected error occurred while retrieving users.")
                );
            }
        }

        // ✅ Get user by ID (lightweight)
        public async Task<Result<GetUserDto>> GetByIdAsync(Guid id)
        {
            try
            {
                var user = await _context.Users
                    .AsNoTracking()
                    .Where(u => u.Id == id)
                    .ProjectTo<GetUserDto>(_mapper.ConfigurationProvider)
                    .FirstOrDefaultAsync();

                return user != null
                    ? Result<GetUserDto>.Success(user)
                    : Result<GetUserDto>.Failure(new Error(ErrorCodes.NotFound, "User not found."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching user {UserId}", id);
                return Result<GetUserDto>.Failure(new Error(ErrorCodes.Failure, "An unexpected error occurred while fetching the user."));
            }
        }

        // ✅ Create user (efficient + cached roles)
        public async Task<Result<GetUserDto>> CreateUserAsync(CreateUserDto request, string createdBy)
        {
            try
            {
                var roles = await GetCachedRolesAsync();
                var role = roles.FirstOrDefault(r => r.Id == request.RoleId);
                if (role == null)
                    return Result<GetUserDto>.Failure(new Error(ErrorCodes.Validation, $"Role '{request.RoleId}' not found."));

                var existingUser = await _userManager.FindByEmailAsync(request.Email);
                if (existingUser != null)
                    return Result<GetUserDto>.Failure(new Error(ErrorCodes.Conflict, $"User with email '{request.Email}' already exists."));

                var user = _mapper.Map<ApplicationUser>(request);
                user.UserName = request.Email;
                user.EmailConfirmed = true;
                user.RoleId = role.Id;

                var createResult = await _userManager.CreateAsync(user, request.Password);
                if (!createResult.Succeeded)
                {
                    var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
                    return Result<GetUserDto>.Failure(new Error(ErrorCodes.Validation, errors));
                }

                user.Role = role;

                var dto = _mapper.Map<GetUserDto>(user);
                dto.RoleId = role.Id;
                dto.Role = role.Name;

                return Result<GetUserDto>.Success(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user {Email}", request.Email);
                return Result<GetUserDto>.Failure(new Error(ErrorCodes.Failure, "An unexpected error occurred while creating the user."));
            }
        }

        // ✅ Delete user safely
        public async Task<Result> DeleteAsync(Guid id)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id.ToString());
                if (user == null)
                    return Result.NotFound(new Error(ErrorCodes.NotFound, "User not found."));

                if (user.RoleId == Guid.Parse("11111111-1111-1111-1111-111111111111")) // Super Admin Role ID
                {
                    _logger.LogWarning("Attempted to delete Super Admin user {UserId}", id);
                    return Result.Failure(new Error(ErrorCodes.Validation, "Cannot delete Super Admin user."));
                }

                var deleteResult = await _userManager.DeleteAsync(user);
                if (!deleteResult.Succeeded)
                {
                    var errors = string.Join("; ", deleteResult.Errors.Select(e => e.Description));
                    return Result.Failure(new Error(ErrorCodes.Failure, errors));
                }

                return Result.Success();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting user {UserId}", id);
                return Result.Failure(new Error(ErrorCodes.Failure, "An unexpected error occurred while deleting the user."));
            }
        }

        // ✅ Update user info + role
        public async Task<Result<GetUserDto>> UpdateUserAsync(UpdateUserDto request, Guid id)
        {
            try
            {
                if (id != request.Id)
                    return Result<GetUserDto>.Failure(new Error(ErrorCodes.Validation, "ID mismatch between route and body."));

                var user = await _userManager.FindByIdAsync(id.ToString());
                if (user == null)
                    return Result<GetUserDto>.Failure(new Error(ErrorCodes.NotFound, "User not found."));

                _mapper.Map(request, user);

                var updateResult = await _userManager.UpdateAsync(user);
                if (!updateResult.Succeeded)
                {
                    var errors = string.Join("; ", updateResult.Errors.Select(e => e.Description));
                    return Result<GetUserDto>.Failure(new Error(ErrorCodes.Validation, errors));
                }

                var roles = await GetCachedRolesAsync();
                var role = roles.FirstOrDefault(r => r.Id == user.RoleId);
                user.Role = role;

                var dto = _mapper.Map<GetUserDto>(user);
                dto.RoleId = role?.Id ?? Guid.Empty;
                dto.Role = role?.Name ?? string.Empty;

                return Result<GetUserDto>.Success(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {UserId}", id);
                return Result<GetUserDto>.Failure(new Error(ErrorCodes.Failure, "An unexpected error occurred while updating the user."));
            }
        }

        // ✅ Get all users (non-paginated)
        public async Task<Result<IEnumerable<GetUserDto>>> GetAllData()
        {
            try
            {
                var users = await _context.Users
                    .AsNoTracking()
                    .OrderBy(r=>r.CreatedAt)
                    .ProjectTo<GetUserDto>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                return Result<IEnumerable<GetUserDto>>.Success(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all user data");
                return Result<IEnumerable<GetUserDto>>.Failure(new Error(ErrorCodes.Failure, "An unexpected error occurred while fetching user data."));
            }
        }

        // ✅ Cached roles (shared with RoleRepository)
        private async Task<List<ApplicationRole>> GetCachedRolesAsync()
        {
            if (_cache.TryGetValue(RolesCacheKey, out List<ApplicationRole> cachedRoles))
            {
                _logger.LogInformation("CACHE HIT: Roles fetched from memory cache");
                return cachedRoles;
            }

            _logger.LogInformation("CACHE MISS: Roles fetched from database");
            var roles = await _roleManager.Roles.AsNoTracking().ToListAsync();

            _cache.Set(RolesCacheKey, roles, new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(20)
            });

            return roles;
        }
    }
}
