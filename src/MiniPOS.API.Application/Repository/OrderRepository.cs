using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MiniPOS.API.Application.Contracts;
using MiniPOS.API.Application.DTOs.Order;
using MiniPOS.API.Common.Constants;
using MiniPOS.API.Common.Results;
using MiniPOS.API.Domain;

namespace MiniPOS.API.Application.Repository
{
    public class OrderRepository : IOrderRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<OrderRepository> _logger;

        public OrderRepository(
            ApplicationDbContext context,
            IMapper mapper,
            ILogger<OrderRepository> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        // 🧾 Create Order
        public async Task<Result<OrderDto>> CreateAsync(OrderCreateDto request)
        {
            _logger.LogInformation("🧾 Creating order for shop {ShopId}", request.ShopId);

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (request == null || request.Items == null || !request.Items.Any())
                {
                    _logger.LogWarning("Invalid order request: {Request}", request);
                    return Result<OrderDto>.Failure(new Error(ErrorCodes.Validation, "Order must contain at least one item."));
                }

                var order = new Order
                {
                    ShopId = request.ShopId,
                    Discount = request.Discount,
                    OrderDate = DateTime.UtcNow,
                    Status = "Completed"
                };

                decimal total = 0;

                foreach (var itemDto in request.Items)
                {
                    var product = await _context.Products
                        .AsTracking()
                        .FirstOrDefaultAsync(p => p.Id == itemDto.ProductId);

                    if (product == null)
                    {
                        _logger.LogWarning("Product {ProductId} not found for order", itemDto.ProductId);
                        return Result<OrderDto>.Failure(new Error(ErrorCodes.NotFound, $"Product {itemDto.ProductId} not found."));
                    }

                    if (product.Quantity < itemDto.Quantity)
                    {
                        _logger.LogWarning("Not enough stock for product {ProductName}. Requested: {Qty}, Available: {AvailableQty}",
                            product.Name, itemDto.Quantity, product.Quantity);

                        return Result<OrderDto>.Failure(new Error(ErrorCodes.BadRequest, $"Not enough stock for {product.Name}."));
                    }

                    product.Quantity -= itemDto.Quantity;

                    var orderItem = new OrderItem
                    {
                        ProductId = product.Id,
                        Quantity = itemDto.Quantity,
                        UnitPrice = product.Price
                    };

                    order.Items.Add(orderItem);
                    total += orderItem.UnitPrice * orderItem.Quantity;
                }

                order.TotalAmount = total;
                order.FinalAmount = total - order.Discount;

                await _context.Orders.AddAsync(order);
                await _context.SaveChangesAsync();

                // Reload with navigation properties for mapping
                await _context.Entry(order)
                    .Collection(o => o.Items)
                    .Query()
                    .Include(i => i.Product)
                    .LoadAsync();

                await transaction.CommitAsync();

                var orderDto = _mapper.Map<OrderDto>(order);
                _logger.LogInformation("✅ Order {OrderId} created successfully", order.Id);

                return Result<OrderDto>.Success(orderDto);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "❌ Failed to create order for shop {ShopId}", request.ShopId);
                return Result<OrderDto>.Failure(new Error("Order.Create.Failed", ex.Message));
            }
        }

        // 🔍 Get Order by Id
        public async Task<Result<OrderDto>> GetByIdAsync(Guid id)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.Items)
                        .ThenInclude(i => i.Product)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(o => o.Id == id);

                if (order == null)
                {
                    _logger.LogWarning("Order {OrderId} not found", id);
                    return Result<OrderDto>.Failure(new Error(ErrorCodes.NotFound, "Order not found."));
                }

                var dto = _mapper.Map<OrderDto>(order);
                _logger.LogDebug("📦 Order {OrderId} retrieved successfully", id);

                return Result<OrderDto>.Success(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Failed to retrieve order {OrderId}", id);
                return Result<OrderDto>.Failure(new Error("Order.GetById.Failed", ex.Message));
            }
        }

        // 📋 Get Paginated Orders for a Shop (with optional date filtering)
        public async Task<PaginatedResult<OrderDto>> GetPagedByShopAsync(Guid shopId, int page, int pageSize, DateTime? startDateUtc = null, DateTime? endDateUtc = null)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);

            try
            {
                var query = _context.Orders
                    .Where(o => o.ShopId == shopId)
                    .OrderByDescending(o => o.OrderDate)
                    .AsNoTracking();

                // Apply date range filter when provided
                if (startDateUtc.HasValue && endDateUtc.HasValue)
                {
                    var start = startDateUtc.Value;
                    var end = endDateUtc.Value;
                    query = query.Where(o => o.OrderDate >= start && o.OrderDate < end);
                }

                var total = await query.CountAsync();
                var totalPages = (int)Math.Ceiling(total / (double)pageSize);

                var orders = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Include(o => o.Items)
                        .ThenInclude(i => i.Product)
                    .ToListAsync();

                var items = _mapper.Map<List<OrderDto>>(orders);

                _logger.LogInformation("📦 Retrieved {Count} orders for shop {ShopId} (page {Page})", items.Count, shopId, page);

                return PaginatedResult<OrderDto>.Success(
                    items: items,
                    pageCount: total,
                    pageNumber: page,
                    pageSize: pageSize,
                    totalPages: totalPages
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Failed to get paginated orders for shop {ShopId}", shopId);
                return PaginatedResult<OrderDto>.Failure(new Error("Order.GetPaged.Failed", ex.Message));
            }
        }

        // ❌ Cancel Order
        public async Task<Result<bool>> CancelAsync(Guid id)
        {
            _logger.LogInformation("⚠️ Attempting to cancel order {OrderId}", id);

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var order = await _context.Orders
                    .Include(o => o.Items)
                        .ThenInclude(i => i.Product)
                    .FirstOrDefaultAsync(o => o.Id == id);

                if (order == null)
                    return Result<bool>.Failure(new Error(ErrorCodes.NotFound, "Order not found."));

                if (order.Status == "Cancelled")
                    return Result<bool>.Failure(new Error(ErrorCodes.BadRequest, "Order already cancelled."));

                // Return stock
                foreach (var item in order.Items)
                {
                    if (item.Product != null)
                    {
                        item.Product.Quantity += item.Quantity;
                    }
                }

                order.Status = "Cancelled";
                _context.Orders.Update(order);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                _logger.LogInformation("✅ Order {OrderId} cancelled successfully", id);

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "❌ Failed to cancel order {OrderId}", id);
                return Result<bool>.Failure(new Error("Order.Cancel.Failed", ex.Message));
            }
        }
    }
}
