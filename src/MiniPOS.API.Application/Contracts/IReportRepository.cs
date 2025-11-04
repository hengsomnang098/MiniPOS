using MiniPOS.API.Application.DTOs.Reports;

namespace MiniPOS.API.Application.Contracts
{
    public interface IReportRepository
    {
        Task<IReadOnlyList<SalesByProductItemDto>> GetSalesByProductAsync(Guid shopId, DateTime startDateUtc, DateTime endDateUtc);
    }
}
