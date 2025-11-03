using MiniPOS.API.Application.DTOs.Product;
using MiniPOS.API.Common.Results;

namespace MiniPOS.API.Application.Contracts
{
    public interface IProductRepository
    {
        Task<PaginatedResult<ProductDto>> GetPagedAsync(Guid shopId,int pageNumber = 1, int pageSize = 10,string search = null);
        Task<Result<ProductDto>> GetByIdAsync(Guid id);
        Task<Result<ProductDto>> CreateAsync(ProductCreateDto dto);
        Task<Result<ProductDto>> UpdateAsync(Guid id, ProductUpdateDto dto);
        Task<Result<bool>> DeleteAsync(Guid id);
    }
}