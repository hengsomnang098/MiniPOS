using MiniPOS.API.Application.DTOs.User;
using MiniPOS.API.Common.Results;

namespace MiniPOS.API.Application.Contracts
{
    public interface IUserRepository
    {
        Task<Result<GetUserDto>> CreateUserAsync(CreateUserDto request, string createdBy);
        Task<Result<IEnumerable<GetUserDto>>> GetAllAsync();
        Task<Result<GetUserDto>> GetByIdAsync(Guid id);
        Task<Result> DeleteAsync(Guid id);
        Task<Result> UpdateUserAsync(UpdateUserDto request, Guid id);

    }
}