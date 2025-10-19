using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using MiniPOS.Application.Interfaces;
using MiniPOS.Constants;
using MiniPOS.Data;
using MiniPOS.DTOs.Category;
using MiniPOS.Results;

namespace MiniPOS.Application.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly ApplicationDbContext context;
        private readonly IStoreRepository storeRepository;
        private readonly IMapper mapper;

        public CategoryRepository(ApplicationDbContext context, IStoreRepository storeRepository, IMapper mapper)
        {
            this.context = context;
            this.storeRepository = storeRepository;
            this.mapper = mapper;
        }
        public Task<bool> CategoryExistsAsync(Guid id)
        {
            return context.Categories.AnyAsync(c => c.Id == id);
        }

        public Task<bool> CategoryExistsAsync(string name)
        {
            return context.Categories.AnyAsync(c => c.CategoryName == name);
        }


        public async Task<Result<GetCategoryDto>> CreateAsync(CreateCategoryDto createCategoryDto)
        {
            var Category = mapper.Map<Category>(createCategoryDto);
            context.Categories.Add(Category);
            await context.SaveChangesAsync();

            var categoryDto = await context.Categories
                .Where(c => c.Id == Category.Id)
                .ProjectTo<GetCategoryDto>(mapper.ConfigurationProvider)
                .FirstAsync();

            return Result<GetCategoryDto>.Success(categoryDto);

        }

        public async Task<Result> DeleteAsync(Guid id)
        {
            var category = await context.Categories.FindAsync(id);
            if (category == null)
            {
                return Result.Failure(new Error(ErrorCodes.NotFound, $"Category '{id}' not found."));
            }

            context.Categories.Remove(category);
            await context.SaveChangesAsync();
            return Result.Success();
        }

        public async Task<Result<IEnumerable<GetCategoryDto>>> GetAllAsync()
        {
            var category = await context.Categories
                .ProjectTo<GetCategoryDto>(mapper.ConfigurationProvider)
                .ToListAsync();
            return Result<IEnumerable<GetCategoryDto>>.Success(category);
        }

        public async Task<Result<GetCategoryDto>> GetByIdAsync(Guid id)
        {
            var category = await context.Categories
                .Where(c => c.Id == id)
                .ProjectTo<GetCategoryDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync();

            if (category == null)
            {
                return Result<GetCategoryDto>.Failure(new Error(ErrorCodes.NotFound, $"Category '{id}' not found."));
            }

            return category != null
                ? Result<GetCategoryDto>.Success(category)
                : Result<GetCategoryDto>.Failure(new Error(ErrorCodes.NotFound, "Category not found."));
        }

        public async Task<Result> UpdateAsync(Guid id, UpdateCategoryDto dto)
        {
            if (id != dto.Id)
            {
                return Result.Failure(new Error(ErrorCodes.BadRequest, "Mismatched Category ID."));
            }
            
            var category = await context.Categories.FindAsync(id);
            if (category == null)
            {
                return Result.Failure(new Error(ErrorCodes.NotFound, $"Category '{id}' not found."));
            }

            mapper.Map(dto, category);
            await context.SaveChangesAsync();
            return Result.Success();
        }
    }
}