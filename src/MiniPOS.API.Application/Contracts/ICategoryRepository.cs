using MiniPOS.API.Application.DTOs.Category;
using MiniPOS.API.Common.Results;

namespace MiniPOS.API.Application.Contracts
{
    public interface ICategoryRepository
    {
        Task<Result<GetCategoryDto>> CreateAsync(CreateCategoryDto request);

        Task<Result<List<GetCategoryDto>>> GetAllCategoriesAsync(Guid shopId);
        Task<PaginatedResult<GetCategoryDto>> GetAllAsync(Guid shopId, int page, int pageSize, string search = null);
        Task<Result<GetCategoryDto>> GetByIdAsync(Guid id);
        Task<Result<GetCategoryDto>> UpdateAsync(UpdateCategoryDto request);
        Task<Result<bool>> DeleteAsync(Guid id);
    }
}
