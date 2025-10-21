using MiniPOS.API.Application.DTOs.Role;
using MiniPOS.API.Common.Results;

namespace MiniPOS.API.Application.Contracts
{
    public interface IRoleRepository
    {
        Task<Result<List<GetRoleDto>>> GetAllAsync();
        Task<Result<GetRoleDto>> GetByIdAsync(Guid id);
        Task<Result<GetRoleDto>> CreateAsync(CreateRoleDto createDto);
        Task<Result<GetRoleDto>> UpdateAsync(Guid id, UpdateRoleDto updateDto);
        Task<Result<bool>> DeleteAsync(Guid id);
        Task<Result<List<PermissionDto>>> GetAvailablePermissionsAsync();
        Task<Result<List<PermissionDto>>> GetRolePermissionsAsync(Guid id);
    }
}