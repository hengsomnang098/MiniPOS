using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
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

    public UserRepository(
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        IMapper mapper,
        ILogger<UserRepository> logger,
        ApplicationDbContext context)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _mapper = mapper;
        _logger = logger;
        _context = context;
    }

    public async Task<Result<GetUserDto>> CreateUserAsync(CreateUserDto request, string createdBy)
    {
        try
        {
            // ✅ Validate role by ID
            var role = await _roleManager.Roles.FirstOrDefaultAsync(r => r.Id == request.RoleId);
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

            return Result<GetUserDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user {Email}", request.Email);
            return Result<GetUserDto>.Failure(
                new Error(ErrorCodes.Failure, "An unexpected error occurred while creating the user."));
        }
    }

    public async Task<Result> DeleteAsync(Guid id)
    {
        var user = _userManager.FindByIdAsync(id.ToString());
        if (user == null)
        {
            return await Task.FromResult(Result.Failure(new Error(ErrorCodes.NotFound, "User not found.")));
        }
        var deleteResult = _userManager.DeleteAsync(user.Result);
        if (!deleteResult.Result.Succeeded)
        {
            var errors = string.Join("; ", deleteResult.Result.Errors.Select(e => e.Description));
            return await Task.FromResult(Result.Failure(new Error(ErrorCodes.Failure, errors)));
        }
        return await Task.FromResult(Result.Success());
    }

    public async Task<Result<IEnumerable<GetUserDto>>> GetAllAsync()
    {
        var users = await _context.Users
            .Include(u => u.Role)
            .ProjectTo<GetUserDto>(_mapper.ConfigurationProvider)
            .AsNoTracking()
            .ToListAsync();

        return Result<IEnumerable<GetUserDto>>.Success(users);
    }

    public async Task<Result<GetUserDto>> GetByIdAsync(Guid id)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .Where(u => u.Id == id)
            .ProjectTo<GetUserDto>(_mapper.ConfigurationProvider)
            .AsNoTracking()
            .FirstOrDefaultAsync();

        return user != null
            ? Result<GetUserDto>.Success(user)
            : Result<GetUserDto>.Failure(new Error(ErrorCodes.NotFound, "User not found."));
    }

    public async Task<Result> UpdateUserAsync(UpdateUserDto request, Guid id)
    {
        if(id != request.Id)
        {
            return Result.Failure(new Error(ErrorCodes.Validation, "ID mismatch between route and body."));
        }

        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null)
        {
            return Result.Failure(new Error(ErrorCodes.NotFound, "User not found."));
        }

        // Update user properties
        _mapper.Map(request, user);

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            var errors = string.Join("; ", updateResult.Errors.Select(e => e.Description));
            return Result.Failure(new Error(ErrorCodes.Validation, errors));
        }

        // Reload role
        var role = await _roleManager.Roles.FirstOrDefaultAsync(r => r.Id == user.RoleId);
        user.Role = role;

        var dto = _mapper.Map<GetUserDto>(user);
        dto.RoleId = role.Id;
        dto.Role = role.Name;

        return Result.Success();
    }
}
