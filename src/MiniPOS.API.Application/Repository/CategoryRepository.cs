using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using MiniPOS.API.Application.Contracts;
using MiniPOS.API.Application.DTOs.Category;
using MiniPOS.API.Common.Constants;
using MiniPOS.API.Common.Results;
using MiniPOS.API.Domain;

namespace MiniPOS.API.Application.Services
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;
        private readonly ILogger<CategoryRepository> _logger;

        // Cache settings
        private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(10);

        public CategoryRepository(
            ApplicationDbContext context,
            IMapper mapper,
            IMemoryCache cache,
            ILogger<CategoryRepository> logger)
        {
            _context = context;
            _mapper = mapper;
            _cache = cache;
            _logger = logger;
        }

        private static string GetCacheKeyForStore(Guid storeId) => $"categories_store_{storeId}";
        private static string GetCacheKeyForCategory(Guid id) => $"category_{id}";

        public async Task<Result<GetCategoryDto>> CreateAsync(CreateCategoryDto request)
        {
            try
            {
                _logger.LogInformation("Creating new category {CategoryName} for shop {ShopId}", request.CategoryName, request.ShopId);
                var category = _mapper.Map<Category>(request);
                await _context.Categories.AddAsync(category);
                await _context.SaveChangesAsync();

                // ✅ Clear cache for this store
                _cache.Remove(GetCacheKeyForStore(category.ShopId));

                // Reload entity with projection
                var categoryWithShop = await _context.Categories
                    .Where(c => c.Id == category.Id)
                    .ProjectTo<GetCategoryDto>(_mapper.ConfigurationProvider)
                    .FirstAsync();

                _cache.Set(GetCacheKeyForCategory(category.Id), categoryWithShop, CacheDuration);

                return Result<GetCategoryDto>.Success(categoryWithShop);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create category");
                return Result<GetCategoryDto>.Failure(new Error("Category.Create.Failed", ex.Message));
            }
        }

        public async Task<Result<List<GetCategoryDto>>> GetAllAsync(Guid storeId)
        {
            var cacheKey = GetCacheKeyForStore(storeId);

            if (_cache.TryGetValue(cacheKey, out List<GetCategoryDto> cachedCategories))
            {
                _logger.LogDebug("✅ Categories for store {StoreId} loaded from cache", storeId);
                return Result<List<GetCategoryDto>>.Success(cachedCategories);
            }

            var categories = await _context.Categories
                .Where(c => c.ShopId == storeId)
                .AsNoTracking()
                .ProjectTo<GetCategoryDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            _cache.Set(cacheKey, categories, CacheDuration);

            _logger.LogDebug("🆕 Categories for store {StoreId} loaded from DB and cached", storeId);

            return Result<List<GetCategoryDto>>.Success(categories);
        }

        public async Task<Result<GetCategoryDto>> GetByIdAsync(Guid id)
        {
            var cacheKey = GetCacheKeyForCategory(id);

            if (_cache.TryGetValue(cacheKey, out GetCategoryDto cachedCategory))
            {
                _logger.LogDebug("✅ Category {CategoryId} loaded from cache", id);
                return Result<GetCategoryDto>.Success(cachedCategory);
            }

            var category = await _context.Categories
                .Where(c => c.Id == id)
                .AsNoTracking()
                .ProjectTo<GetCategoryDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync();

            if (category == null)
                return Result<GetCategoryDto>.Failure(new Error(ErrorCodes.NotFound, "Category not found."));

            _cache.Set(cacheKey, category, CacheDuration);

            _logger.LogDebug("🆕 Category {CategoryId} loaded from DB and cached", id);

            return Result<GetCategoryDto>.Success(category);
        }

        public async Task<Result<GetCategoryDto>> UpdateAsync(UpdateCategoryDto request)
        {
            var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == request.Id);
            _logger.LogInformation("Check updating category {CategoryId} for shop {ShopId}", request.Id, category?.ShopId);
            if (category == null)
                return Result<GetCategoryDto>.Failure(new Error(ErrorCodes.NotFound, "Category not found from update. "));
            _mapper.Map(request, category);
    
            _context.Categories.Update(category);

            try
            {
                await _context.SaveChangesAsync();

                // Invalidate caches
                _cache.Remove(GetCacheKeyForCategory(category.Id));
                _cache.Remove(GetCacheKeyForStore(category.ShopId));

                var updatedCategory = await _context.Categories
                    .Where(c => c.Id == category.Id)
                    .ProjectTo<GetCategoryDto>(_mapper.ConfigurationProvider)
                    .FirstAsync();

                _cache.Set(GetCacheKeyForCategory(category.Id), updatedCategory, CacheDuration);

                return Result<GetCategoryDto>.Success(updatedCategory);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update category");
                return Result<GetCategoryDto>.Failure(new Error("Category.Update.Failed", ex.Message));
            }
        }

        public async Task<Result<bool>> DeleteAsync(Guid id)
        {
            var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id);
            if (category == null)
                return Result<bool>.Failure(new Error(ErrorCodes.NotFound, "Category not found."));

            _context.Categories.Remove(category);

            try
            {
                await _context.SaveChangesAsync();

                // Invalidate caches
                _cache.Remove(GetCacheKeyForCategory(id));
                _cache.Remove(GetCacheKeyForStore(category.ShopId));

               return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete category");
                return Result<bool>.Failure(new Error(ErrorCodes.BadRequest, ex.Message));
            }
        }
    }
}
