using MiniPOS.API.Application.DTOs.User;
using MiniPOS.API.Common.Results;

namespace MiniPOS.API.Application.Contracts
{
    public interface IUserRepository
    {
        Task<Result<GetUserDto>> CreateUserAsync(CreateUserDto request, string createdBy);
        Task<PaginatedResult<GetUserDto>> GetAllAsync(int page, int pageSize, string search = null);
        Task<Result<IEnumerable<GetUserDto>>> GetAllData();
        Task<Result<GetUserDto>> GetByIdAsync(Guid id);
        Task<Result> DeleteAsync(Guid id);
        Task<Result<GetUserDto>> UpdateUserAsync(UpdateUserDto request, Guid id);

    }
}