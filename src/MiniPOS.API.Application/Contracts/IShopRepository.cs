using MiniPOS.API.Application.DTOs.Shop;
using MiniPOS.API.Common.Results;

namespace MiniPOS.API.Application.Contracts
{
    public interface IShopRepository
    {
        Task<PaginatedResult<GetShopDto>> GetAllAsync(int page, int pageSize,string search = null);
        Task<Result<GetShopDto>> GetByIdAsync(Guid id);
        Task<Result<GetShopDto>> CreateAsync(CreateShopDto dto);
        Task<Result<GetShopDto>> UpdateAsync(Guid id, UpdateShopDto dto);
        Task<Result<bool>> DeleteAsync(Guid id);
    }
}
