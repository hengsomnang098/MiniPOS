using MiniPOS.DTOs.Category;
using MiniPOS.Results;

namespace MiniPOS.Application.Interfaces
{
    public interface ICategoryRepository
    {
        Task<Result<IEnumerable<GetCategoryDto>>> GetAllAsync();
        Task<Result<GetCategoryDto>> GetByIdAsync(Guid id);
        Task<Result<GetCategoryDto>> CreateAsync(CreateCategoryDto createDto);
        Task<Result> UpdateAsync(Guid id, UpdateCategoryDto dto);
        Task<Result> DeleteAsync(Guid id);
        Task<bool> CategoryExistsAsync(Guid id);
        Task<bool> CategoryExistsAsync(string name);
    }
}