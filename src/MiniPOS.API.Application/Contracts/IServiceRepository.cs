using MiniPOS.API.Application.DTOs.Service;
using MiniPOS.API.Common.Results;

namespace MiniPOS.API.Application.Contracts
{
    public interface IServiceRepository
    {
        Task<Result<GetServiceDto>> CreateServiceAsync(CreateServiceDto createServiceDto);
        // Task<Result<IEnumerable<GetServiceDto>>> GetAllAsync();
       Task<PaginatedResult<GetServiceDto>> GetAllAsync(Guid shopId, int page, int pageSize,string search =null);

        Task<Result<GetServiceDto>> GetByIdAsync(Guid id);
        Task<Result<bool>> DeleteAsync(Guid id);
        Task<Result<GetServiceDto>> UpdateServiceAsync(UpdateServiceDto updateServiceDto, Guid id);
    }
}