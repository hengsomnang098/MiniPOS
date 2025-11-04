using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MiniPOS.API.Application.Contracts;
using MiniPOS.API.Authorization;
using MiniPOS.API.Common.Constants;
using MiniPOS.API.Application.DTOs.Reports;
using System.Text;

namespace MiniPOS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting(RateLimitingConstants.PerUserPolicy)]
    [Authorize]
    public class ReportsController : BaseApiController
    {
        private readonly IReportRepository _reportRepository;

        public ReportsController(IReportRepository reportRepository)
        {
            _reportRepository = reportRepository;
        }

        private static DateTime NormalizeToUtc(DateTime dt)
        {
            return dt.Kind switch
            {
                DateTimeKind.Utc => dt,
                DateTimeKind.Local => dt.ToUniversalTime(),
                _ => DateTime.SpecifyKind(dt, DateTimeKind.Utc)
            };
        }

        // GET: api/Reports/sales-by-product?shopId={id}&startDate=2025-11-01&endDate=2025-11-04
        [HttpGet("sales-by-product")]
        [HasPermission(Permissions.Orders.View)]
        public async Task<ActionResult<IReadOnlyList<SalesByProductItemDto>>> GetSalesByProduct(
            [FromQuery] Guid shopId,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            if (shopId == Guid.Empty)
            {
                return BadRequest("shopId is required");
            }

            var utcTodayStart = DateTime.UtcNow.Date;
            var utcTomorrowStart = utcTodayStart.AddDays(1);

            var startUtc = startDate.HasValue ? NormalizeToUtc(startDate.Value) : utcTodayStart;
            var endUtc = endDate.HasValue ? NormalizeToUtc(endDate.Value) : utcTomorrowStart;

            if (endUtc <= startUtc)
            {
                endUtc = startUtc.AddDays(1);
            }

            var result = await _reportRepository.GetSalesByProductAsync(shopId, startUtc, endUtc);
            return Ok(result);
        }

        // GET: api/Reports/sales-by-product/export?shopId={id}&startDate=...&endDate=...&format=csv
        [HttpGet("sales-by-product/export")]
        [HasPermission(Permissions.Orders.View)]
        public async Task<IActionResult> ExportSalesByProduct(
            [FromQuery] Guid shopId,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string format = "csv")
        {
            if (shopId == Guid.Empty)
            {
                return BadRequest("shopId is required");
            }

            var utcTodayStart = DateTime.UtcNow.Date;
            var utcTomorrowStart = utcTodayStart.AddDays(1);

            var startUtc = startDate.HasValue ? NormalizeToUtc(startDate.Value) : utcTodayStart;
            var endUtc = endDate.HasValue ? NormalizeToUtc(endDate.Value) : utcTomorrowStart;
            if (endUtc <= startUtc)
            {
                endUtc = startUtc.AddDays(1);
            }

            var items = await _reportRepository.GetSalesByProductAsync(shopId, startUtc, endUtc);

            // Only CSV export implemented server-side for simplicity; PDF handled on frontend
            var csv = new StringBuilder();
            csv.AppendLine("Product Name,Total Quantity,Total Revenue");
            foreach (var i in items)
            {
                // Escape commas and quotes in product name
                var name = i.ProductName?.Replace("\"", "\"\"") ?? string.Empty;
                if (name.Contains(',') || name.Contains('"'))
                {
                    name = $"\"{name}\"";
                }
                csv.AppendLine($"{name},{i.TotalQuantity},{i.TotalRevenue}");
            }

            var fileName = $"sales_by_product_{startUtc:yyyyMMdd}-{endUtc.AddDays(-1):yyyyMMdd}.csv";
            var bytes = Encoding.UTF8.GetBytes(csv.ToString());
            return File(bytes, "text/csv", fileName);
        }
    }
}
