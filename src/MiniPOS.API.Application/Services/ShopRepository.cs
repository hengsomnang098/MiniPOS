using AutoMapper;
using AutoMapper.QueryableExtensions;
using MiniPOS.API.Application.Contracts;
using MiniPOS.API.Application.DTOs.Shop;
using MiniPOS.API.Common.Results;
using MiniPOS.API.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MiniPOS.API.Common.Constants;

namespace MiniPOS.API.Application.Services
{
    public class ShopRepository : IShopRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<ShopRepository> _logger;

        public ShopRepository(ApplicationDbContext context, IMapper mapper, ILogger<ShopRepository> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<PaginatedResult<GetShopDto>> GetAllAsync(
            int page, int pageSize, Guid userId, bool isSuperAdmin)
        {
            // ✅ Safety: prevent invalid pagination values
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);


            var query = _context.Shops.AsQueryable();
            if (!isSuperAdmin) query = query.Where(s => s.UserId == userId);

            var total = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(total / (double)pageSize);
            var shops = await query
                .OrderByDescending(s => s.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .Include(s => s.User)
                .ProjectTo<GetShopDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            var result = PaginatedResult<GetShopDto>.Success(
                items: shops,
                pageCount: total,
                pageNumber: page,
                pageSize: pageSize,
                totalPages: totalPages
            );
            return result;
        }


        public async Task<Result<GetShopDto>> GetByIdAsync(Guid id)
        {

            var shop = await _context.Shops.Include(s => s.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == id);

            if (shop == null)
                return Result<GetShopDto>.Failure(new Error(ErrorCodes.NotFound, "Shop not found"));

            var dto = _mapper.Map<GetShopDto>(shop);
            if (shop.User == null)
            {
                _logger.LogWarning("Shop {ShopId} has no associated user.", id);
            }
            var result = Result<GetShopDto>.Success(dto);
            return result;
        }

        public async Task<Result<GetShopDto>> CreateAsync(CreateShopDto dto)
        {
            try
            {
                var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == dto.UserId);
                if (user == null)
                {
                    _logger.LogWarning("Shop creation failed: User {UserId} not found.", dto.UserId);
                    return Result<GetShopDto>.Failure(new Error(ErrorCodes.NotFound, "User not found"));
                }

                var shop = _mapper.Map<Shop>(dto);
                shop.UserId = user.Id;
                shop.SubscriptionStartDate = DateTime.SpecifyKind(dto.SubscriptionStartDate, DateTimeKind.Utc);
                shop.SubscriptionEndDate = DateTime.SpecifyKind(dto.SubscriptionEndDate, DateTimeKind.Utc);

                _context.Shops.Add(shop);
                await _context.SaveChangesAsync();

                var createdShop = await _context.Shops
                    .Include(s => s.User)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(s => s.Id == shop.Id);

                var result = _mapper.Map<GetShopDto>(createdShop);


                return Result<GetShopDto>.Success(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating a new shop.");
                return Result<GetShopDto>.Failure(new Error(ErrorCodes.Failure, "An unexpected error occurred while creating the shop."));
            }
        }
        public async Task<Result<GetShopDto>> UpdateAsync(Guid id, UpdateShopDto dto)
        {
            _logger.LogInformation("Entering UpdateAsync for ShopId: {ShopId}", id);

            if (id != dto.Id)
            {
                _logger.LogWarning("Shop update failed: ID mismatch. Route ID: {RouteId}, Body ID: {BodyId}", id, dto.Id);
                return Result<GetShopDto>.Failure(new Error("Validation", "ID mismatch between route and body."));
            }

            var existingShop = await _context.Shops.FirstOrDefaultAsync(s => s.Id == id);
            if (existingShop == null)
            {
                _logger.LogWarning("Shop update failed: Shop {ShopId} not found in database.", id);
                return Result<GetShopDto>.Failure(new Error(ErrorCodes.NotFound, "Shop not found"));
            }

            try
            {
                _mapper.Map(dto, existingShop);

                existingShop.SubscriptionStartDate = DateTime.SpecifyKind(dto.SubscriptionStartDate, DateTimeKind.Utc);
                existingShop.SubscriptionEndDate = DateTime.SpecifyKind(dto.SubscriptionEndDate, DateTimeKind.Utc);

                _context.Entry(existingShop).State = EntityState.Modified;


                var affectedRows = await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while updating Shop {ShopId}", id);
                return Result<GetShopDto>.Failure(new Error(ErrorCodes.Failure, "An unexpected error occurred."));
            }

            // Reload the updated shop
            var updatedShop = await _context.Shops
                .Include(s => s.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == id);

            if (updatedShop == null)
            {
                _logger.LogWarning("Failed to reload updated Shop {ShopId} after update.", id);
                return Result<GetShopDto>.Failure(new Error(ErrorCodes.NotFound, "Shop not found after update"));
            }

            _logger.LogInformation("Successfully reloaded Shop {ShopId} after update.", id);

            var result = _mapper.Map<GetShopDto>(updatedShop);
            return Result<GetShopDto>.Success(result);
        }



        public async Task<Result<bool>> DeleteAsync(Guid id)
        {
            try
            {
                var shop = await _context.Shops.FindAsync(id);
                if (shop == null)
                    return Result<bool>.Failure(new Error(ErrorCodes.NotFound, "Shop not found"));

                _context.Shops.Remove(shop);
                await _context.SaveChangesAsync();

                return Result<bool>.Success(true);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting Shop {ShopId}.", id);
                return Result<bool>.Failure(new Error(ErrorCodes.Failure, "An unexpected error occurred while deleting the shop."));
            }
        }
    }
}
