

using MiniPOS.DTOs.Store;
using MiniPOS.Results;


namespace MiniPOS.Application.Interfaces
{
    public interface IStoreRepository 
    {
        Task<bool> StoreExistAsync(Guid id);
        Task<bool> StoreExistAsync(string name);
        Task<Result<IEnumerable<GetStoreDto>>> GetAllAsync();
        Task<Result<GetStoreDto>> GetDetailsAsync(Guid id);
        Task<Result<GetStoreDto>> CreateAsync(CreateStoreDto createDto);
        Task<Result> UpdateAsync(Guid id, UpdateStoreDto updateDto);
        Task<Result> DeleteAsync(Guid id);
    }
}