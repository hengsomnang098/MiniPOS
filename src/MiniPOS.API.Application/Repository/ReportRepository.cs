using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MiniPOS.API.Application.Contracts;
using MiniPOS.API.Application.DTOs.Reports;
using MiniPOS.API.Domain;

namespace MiniPOS.API.Application.Repository
{
    public class ReportRepository : IReportRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ReportRepository> _logger;

        public ReportRepository(ApplicationDbContext context, ILogger<ReportRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IReadOnlyList<SalesByProductItemDto>> GetSalesByProductAsync(Guid shopId, DateTime startDateUtc, DateTime endDateUtc)
        {
            // Ensure valid range
            if (endDateUtc <= startDateUtc)
            {
                endDateUtc = startDateUtc.AddDays(1);
            }

            _logger.LogInformation("Generating sales-by-product report for Shop {ShopId} from {Start} to {End}", shopId, startDateUtc, endDateUtc);

            var query = from oi in _context.OrderItems.AsNoTracking()
                        join o in _context.Orders.AsNoTracking() on oi.OrderId equals o.Id
                        join p in _context.Products.AsNoTracking() on oi.ProductId equals p.Id
                        where o.Status == "Completed"
                              && o.ShopId == shopId
                              && o.OrderDate >= startDateUtc
                              && o.OrderDate < endDateUtc
                        group new { oi, p } by new { oi.ProductId, p.Name } into g
                        select new SalesByProductItemDto
                        {
                            ProductId = g.Key.ProductId,
                            ProductName = g.Key.Name,
                            TotalQuantity = g.Sum(x => x.oi.Quantity),
                            TotalRevenue = g.Sum(x => x.oi.Quantity * x.oi.UnitPrice)
                        };

            var items = await query
                .OrderByDescending(x => x.TotalRevenue)
                .ThenByDescending(x => x.TotalQuantity)
                .ToListAsync();

            return items;
        }
    }
}
