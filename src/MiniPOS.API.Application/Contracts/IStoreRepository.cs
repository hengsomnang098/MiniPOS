

using MiniPOS.API.Application.DTOs.Store;
using MiniPOS.API.Common.Results;



namespace MiniPOS.API.Application.Contracts
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