using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
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
        private readonly ILogger<CategoryRepository> _logger;


        public CategoryRepository(
            ApplicationDbContext context,
            IMapper mapper,
            ILogger<CategoryRepository> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }


        public async Task<Result<GetCategoryDto>> CreateAsync(CreateCategoryDto request)
        {
            try
            {
                var category = _mapper.Map<Category>(request);

                if (category == null)
                {
                    _logger.LogError("Mapping CreateCategoryDto to Category resulted in null");
                    return Result<GetCategoryDto>.Failure(new Error(ErrorCodes.Validation, "Invalid category data."));
                }
                
                await _context.Categories.AddAsync(category);
                await _context.SaveChangesAsync();

                // Reload entity with projection
                var categoryWithShop = await _context.Categories
                    .Where(c => c.Id == category.Id)
                    .ProjectTo<GetCategoryDto>(_mapper.ConfigurationProvider)
                    .FirstAsync();

                return Result<GetCategoryDto>.Success(categoryWithShop);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create category");
                return Result<GetCategoryDto>.Failure(new Error("Category.Create.Failed", ex.Message));
            }
        }

        public async Task<PaginatedResult<GetCategoryDto>> GetAllAsync(Guid shopId, int page, int pageSize, string search = null)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);

            var query = _context.Categories
            .Where(s => s.ShopId == shopId)
            .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(c => c.CategoryName.ToLower().Contains(search));
            }

            var total = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(total / (double)pageSize);

            var categories = await query
                .Where(s => s.ShopId == shopId)
                .OrderBy(s => s.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .ProjectTo<GetCategoryDto>(_mapper.ConfigurationProvider)
                .ToListAsync();
            if (categories == null) return PaginatedResult<GetCategoryDto>.Success( items: categories,
                pageCount: total,
                pageNumber: page,
                pageSize: pageSize,
                totalPages: totalPages);

            var result = PaginatedResult<GetCategoryDto>.Success(
                items: categories,
                pageCount: total,
                pageNumber: page,
                pageSize: pageSize,
                totalPages: totalPages
            );

            return result;
        }

        public async Task<Result<GetCategoryDto>> GetByIdAsync(Guid id)
        {
            var category = await _context.Categories
                .Where(c => c.Id == id)
                .AsNoTracking()
                .ProjectTo<GetCategoryDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync();

            if (category == null)
                return Result<GetCategoryDto>.Failure(new Error(ErrorCodes.NotFound, "Category not found."));


            _logger.LogDebug("🆕 Category {CategoryId} loaded from DB and cached", id);

            return Result<GetCategoryDto>.Success(category);
        }

        public async Task<Result<GetCategoryDto>> UpdateAsync(UpdateCategoryDto request)
        {
            var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == request.Id);
            _logger.LogInformation("Check updating category {CategoryId} for shop {ShopId}", request.Id, category?.ShopId);
            if (category == null)
                return Result<GetCategoryDto>.Failure(new Error(ErrorCodes.Validation, "Category not found from update. "));
            _mapper.Map(request, category);

            _context.Categories.Update(category);

            try
            {
                await _context.SaveChangesAsync();


                var updatedCategory = await _context.Categories
                    .Where(c => c.Id == category.Id)
                    .ProjectTo<GetCategoryDto>(_mapper.ConfigurationProvider)
                    .FirstAsync();


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
                return Result<bool>.Failure(new Error(ErrorCodes.Validation, "Category not found."));

            _context.Categories.Remove(category);

            try
            {
                await _context.SaveChangesAsync();


                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete category");
                return Result<bool>.Failure(new Error(ErrorCodes.BadRequest, ex.Message));
            }
        }

        // get all category no pagination
        public async Task<Result<List<GetCategoryDto>>> GetAllCategoriesAsync(Guid shopId)
        {
            try
            {
                var categories = await _context.Categories
                    .Where(c => c.ShopId == shopId)
                    .AsNoTracking()
                    .ProjectTo<GetCategoryDto>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                return Result<List<GetCategoryDto>>.Success(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get all categories without pagination for shop {ShopId}", shopId);
                return Result<List<GetCategoryDto>>.Failure(new Error("Category.GetAllNoPagination.Failed", ex.Message));
            }
        }


    }
}
