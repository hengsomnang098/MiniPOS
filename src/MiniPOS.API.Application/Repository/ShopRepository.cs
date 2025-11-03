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

        #region GetAll / GetById

        public async Task<PaginatedResult<GetShopDto>> GetAllAsync(int page, int pageSize, string search = null)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);

            var query = _context.Shops.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim().ToLower();
                query = query.Where(s =>
                    s.Name.ToLower().Contains(search) ||
                    s.User.FullName.ToLower().Contains(search)
                );
            }

            var total = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(total / (double)pageSize);

            // ✅ Let AutoMapper handle the joins automatically
            var shops = await query
                .OrderByDescending(s => s.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
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
            // ✅ Use ProjectTo instead of Include + manual mapping
            var shop = await _context.Shops
                .Where(s => s.Id == id)
                .AsNoTracking()
                .ProjectTo<GetShopDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync();

            if (shop == null)
                return Result<GetShopDto>.Failure(new Error(ErrorCodes.NotFound, "Shop not found"));

            return Result<GetShopDto>.Success(shop);
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
                    return Result<GetShopDto>.Failure(new Error(ErrorCodes.Validation, "User not found"));
                }

                var shop = _mapper.Map<Shop>(dto);
                shop.UserId = user.Id;
                shop.CreatedAt = DateTime.UtcNow;
                shop.SubscriptionStartDate = DateTime.SpecifyKind(dto.SubscriptionStartDate, DateTimeKind.Utc);
                shop.SubscriptionEndDate = DateTime.SpecifyKind(dto.SubscriptionEndDate, DateTimeKind.Utc);

                _context.Shops.Add(shop);
                await _context.SaveChangesAsync();

                // ✅ No need for Include — use projection
                var createdShop = await _context.Shops
                    .Where(s => s.Id == shop.Id)
                    .AsNoTracking()
                    .ProjectTo<GetShopDto>(_mapper.ConfigurationProvider)
                    .FirstOrDefaultAsync();

                return Result<GetShopDto>.Success(createdShop!);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating a new shop.");
                return Result<GetShopDto>.Failure(
                    new Error(ErrorCodes.Failure, "An unexpected error occurred while creating the shop.")
                );
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
                return Result<GetShopDto>.Failure(new Error(ErrorCodes.Validation, "ID mismatch between route and body."));
            }

            var existingShop = await _context.Shops.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id);
            if (existingShop == null)
            {
                return Result<GetShopDto>.Failure(new Error(ErrorCodes.Validation, "Shop not found"));
            }

            var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == dto.UserId);
            if (user == null)
            {
                return Result<GetShopDto>.Failure(new Error(ErrorCodes.Validation, "User not found"));
            }

            try
            {
                var originalCreatedAt = existingShop.CreatedAt;
                _mapper.Map(dto, existingShop);
                existingShop.CreatedAt = originalCreatedAt;

                EnsureUtcDates(existingShop);

                _context.Shops.Attach(existingShop);
                _context.Entry(existingShop).State = EntityState.Modified;
                _context.Entry(existingShop).Property(x => x.CreatedAt).IsModified = false;
                _context.Entry(existingShop).Property(x => x.UserId).IsModified = true;

                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while updating Shop {ShopId}", id);
                return Result<GetShopDto>.Failure(new Error(ErrorCodes.Failure, "An unexpected error occurred."));
            }

            // ✅ Simplify reload
            var updatedShop = await _context.Shops
                .Where(s => s.Id == id)
                .AsNoTracking()
                .ProjectTo<GetShopDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync();

            if (updatedShop == null)
            {
                _logger.LogWarning("Failed to reload updated Shop {ShopId} after update.", id);
                return Result<GetShopDto>.Failure(new Error(ErrorCodes.Validation, "Shop not found after update"));
            }

            return Result<GetShopDto>.Success(updatedShop);
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
                    return Result<bool>.Failure(new Error(ErrorCodes.Validation, "Shop not found"));

                _context.Shops.Remove(shop);
                await _context.SaveChangesAsync();

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting Shop {ShopId}.", id);
                return Result<bool>.Failure(
                    new Error(ErrorCodes.Failure, "An unexpected error occurred while deleting the shop.")
                );
            }
        }

        #endregion
    }
}
