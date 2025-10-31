using AutoMapper;
using AutoMapper.QueryableExtensions;
using MiniPOS.API.Application.Contracts;
using MiniPOS.API.Application.DTOs.Shop;
using MiniPOS.API.Common.Results;
using MiniPOS.API.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Memory;
using MiniPOS.API.Common.Constants;

namespace MiniPOS.API.Application.Services
{
    public class ShopRepository : IShopRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
    private readonly ILogger<ShopRepository> _logger;
    private readonly IMemoryCache _cache;

        public ShopRepository(ApplicationDbContext context, IMapper mapper, ILogger<ShopRepository> logger, IMemoryCache cache)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
            _cache = cache;
        }

        #region GetAll / GetById

        public async Task<PaginatedResult<GetShopDto>> GetAllAsync(
            int page, int pageSize, Guid userId, bool isSuperAdmin)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);

            string cacheKey = $"ShopRepository_GetAll_{page}_{pageSize}_{userId}_{isSuperAdmin}";
            if (_cache.TryGetValue(cacheKey, out PaginatedResult<GetShopDto> cachedResult))
            {
                return cachedResult;
            }

            var query = _context.Shops.AsQueryable();
            if (!isSuperAdmin)
                query = query.Where(s => s.UserId == userId);

            var total = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(total / (double)pageSize);

            var shops = await query
                .OrderByDescending(s => s.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(s => s.User)
                .AsNoTracking()
                .ProjectTo<GetShopDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            var result = PaginatedResult<GetShopDto>.Success(
                items: shops,
                pageCount: total,
                pageNumber: page,
                pageSize: pageSize,
                totalPages: totalPages
            );

            _cache.Set(cacheKey, result, TimeSpan.FromMinutes(5));
            return result;
        }

        public async Task<Result<GetShopDto>> GetByIdAsync(Guid id)
        {
            string cacheKey = $"ShopRepository_GetById_{id}";
            if (_cache.TryGetValue(cacheKey, out Result<GetShopDto> cachedResult))
            {
                return cachedResult;
            }

            var shop = await _context.Shops
                .Include(s => s.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == id);

            if (shop == null)
                return Result<GetShopDto>.Failure(new Error(ErrorCodes.NotFound, "Shop not found"));

            var result = Result<GetShopDto>.Success(_mapper.Map<GetShopDto>(shop));
            _cache.Set(cacheKey, result, TimeSpan.FromMinutes(5));
            return result;
        }

        #endregion

        #region Create

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

                // ✅ Set timestamps
                shop.CreatedAt = DateTime.UtcNow;
                shop.SubscriptionStartDate = DateTime.SpecifyKind(dto.SubscriptionStartDate, DateTimeKind.Utc);
                shop.SubscriptionEndDate = DateTime.SpecifyKind(dto.SubscriptionEndDate, DateTimeKind.Utc);

                _context.Shops.Add(shop);
                await _context.SaveChangesAsync();

                // Invalidate all Shop cache
                ClearShopCache();

                var createdShop = await _context.Shops
                    .Include(s => s.User)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(s => s.Id == shop.Id);

                return Result<GetShopDto>.Success(_mapper.Map<GetShopDto>(createdShop));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating a new shop.");
                return Result<GetShopDto>.Failure(
                    new Error(ErrorCodes.Failure, "An unexpected error occurred while creating the shop."));
            }
        }

        #endregion

        #region Update

    public async Task<Result<GetShopDto>> UpdateAsync(Guid id, UpdateShopDto dto)
        {
            _logger.LogInformation("Entering UpdateAsync for ShopId: {ShopId}", id);
            _logger.LogInformation("Frontend payload for Shop update {@ShopUpdateDto}", dto);

            if (id != dto.Id)
            {
                return Result<GetShopDto>.Failure(new Error("Validation", "ID mismatch between route and body."));
            }

            // Invalidate all Shop cache
            ClearShopCache();

            var existingShop = await _context.Shops.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id);
            if (existingShop == null)
            {
                return Result<GetShopDto>.Failure(new Error(ErrorCodes.NotFound, "Shop not found"));
            }

            var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == dto.UserId);
            if (user == null)
            {
                return Result<GetShopDto>.Failure(new Error(ErrorCodes.NotFound, "User not found"));
            }

            try
            {
                var originalCreatedAt = existingShop.CreatedAt;

                _mapper.Map(dto, existingShop);
                existingShop.CreatedAt = originalCreatedAt;

                EnsureUtcDates(existingShop);

                _context.Shops.Attach(existingShop);
                _context.Entry(existingShop).State = EntityState.Modified;

                // ✅ Protect timestamps
                _context.Entry(existingShop).Property(x => x.CreatedAt).IsModified = false;

                // ✅ Ensure UserId persists when changed
                _context.Entry(existingShop).Property(x => x.UserId).IsModified = true;

                var affected = await _context.SaveChangesAsync();
                _logger.LogInformation("Shop {ShopId} updated successfully ({Affected} rows changed).", id, affected);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while updating Shop {ShopId}", id);
                return Result<GetShopDto>.Failure(new Error(ErrorCodes.Failure, "An unexpected error occurred."));
            }

            // ✅ Reload with user for return
            var updatedShop = await _context.Shops
                .Include(s => s.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == id);

            if (updatedShop == null)
            {
                _logger.LogWarning("Failed to reload updated Shop {ShopId} after update.", id);
                return Result<GetShopDto>.Failure(new Error(ErrorCodes.NotFound, "Shop not found after update"));
            }

            _logger.LogInformation("✅ Updated Shop reloaded from DB {@UpdatedShop}", updatedShop);

            return Result<GetShopDto>.Success(_mapper.Map<GetShopDto>(updatedShop));
        }

        private void EnsureUtcDates(Shop shop)
        {
            if (shop.SubscriptionStartDate.Kind != DateTimeKind.Utc)
                shop.SubscriptionStartDate = DateTime.SpecifyKind(shop.SubscriptionStartDate, DateTimeKind.Utc);

            if (shop.SubscriptionEndDate.Kind != DateTimeKind.Utc)
                shop.SubscriptionEndDate = DateTime.SpecifyKind(shop.SubscriptionEndDate, DateTimeKind.Utc);

            if (shop.CreatedAt.Kind != DateTimeKind.Utc)
                shop.CreatedAt = DateTime.SpecifyKind(shop.CreatedAt, DateTimeKind.Utc);

        }

        #endregion

        #region Delete

        public async Task<Result<bool>> DeleteAsync(Guid id)
        {
            try
            {
                var shop = await _context.Shops.FindAsync(id);
                if (shop == null)
                    return Result<bool>.Failure(new Error(ErrorCodes.NotFound, "Shop not found"));

                _context.Shops.Remove(shop);
                await _context.SaveChangesAsync();

                // Invalidate all Shop cache
                ClearShopCache();

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting Shop {ShopId}.", id);
                return Result<bool>.Failure(
                    new Error(ErrorCodes.Failure, "An unexpected error occurred while deleting the shop."));
            }
        }

        // Remove all Shop cache entries (simple approach: clear all cache, or use a prefix if using a distributed cache)
        private void ClearShopCache()
        {
            // IMemoryCache does not support clearing by prefix, so clear all (or use a custom solution for large apps)
            if (_cache is MemoryCache memCache)
            {
                memCache.Compact(1.0); // Remove all cache entries
            }
        }

        #endregion
    }
}
