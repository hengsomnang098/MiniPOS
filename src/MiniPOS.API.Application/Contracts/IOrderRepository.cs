using MiniPOS.API.Application.DTOs.Order;
using MiniPOS.API.Common.Results;

namespace MiniPOS.API.Application.Contracts;

public interface IOrderRepository
{
        Task<Result<OrderDto>> CreateAsync(OrderCreateDto request);
        Task<Result<OrderDto>> GetByIdAsync(Guid id);
        Task<PaginatedResult<OrderDto>> GetPagedByShopAsync(Guid shopId, int page, int pageSize, DateTime? startDateUtc = null, DateTime? endDateUtc = null);
        Task<Result<bool>> CancelAsync(Guid id);
}
