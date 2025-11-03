using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MiniPOS.API.Application.Contracts;
using MiniPOS.API.Application.DTOs.Product;
using MiniPOS.API.Common.Constants;
using MiniPOS.API.Common.Results;
using MiniPOS.API.Domain;

namespace MiniPOS.API.Application.Repository
{
    public class ProductRepository : IProductRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<ProductRepository> _logger;
        private readonly IFileUploadService _fileUploadService;

        public ProductRepository(
            ApplicationDbContext context,
            IMapper mapper,
            ILogger<ProductRepository> logger,
            IFileUploadService fileUploadService)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
            _fileUploadService = fileUploadService;
        }


        // 🔍 Get Single Product
        public async Task<Result<ProductDto>> GetByIdAsync(Guid id)
        {
            var product = await _context.Products
                .Include(p => p.Service)
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
                return Result<ProductDto>.Failure(new Error(ErrorCodes.NotFound, "Product not found."));

            var dto = _mapper.Map<ProductDto>(product);
            dto.ServiceName = product.Service?.Name;

            return Result<ProductDto>.Success(dto);
        }

        // ➕ Create Product
        // ➕ Create Product
        public async Task<Result<ProductDto>> CreateAsync(ProductCreateDto dto)
        {
            // 🧾 Log all incoming data from frontend
            _logger.LogInformation("📦 Creating product with data: {@Dto}", dto);

            if (dto == null)
            {
                _logger.LogWarning("❌ Received null ProductCreateDto");
                return Result<ProductDto>.Failure(new Error(ErrorCodes.BadRequest, "Invalid product data."));
            }

            if (!await _context.Services.AnyAsync(s => s.Id == dto.ServiceId))
            {
                _logger.LogWarning("⚠️ ServiceId not found: {ServiceId}", dto.ServiceId);
                return Result<ProductDto>.Failure(new Error(ErrorCodes.NotFound, "ServiceId not found."));
            }

            var product = _mapper.Map<Product>(dto);
            product.CreatedAt = DateTime.UtcNow;

            // ✅ Handle BunnyCDN Image Upload (if present)
            if (dto.ImageUrl != null && dto.ImageUrl.Length > 0)
            {
                _logger.LogInformation("🖼 Uploading image to BunnyCDN for product: {Name}", dto.Name);
                var imageUrl = await _fileUploadService.UploadToBunnyCdnAsync(dto.ImageUrl, "MiniPOS");
                product.ImageUrl = imageUrl;
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            _logger.LogInformation("✅ Product created successfully with Id: {ProductId}", product.Id);

            var resultDto = _mapper.Map<ProductDto>(product);
            resultDto.ServiceName = (await _context.Services.FindAsync(dto.ServiceId))?.Name;

            return Result<ProductDto>.Success(resultDto);
        }


        // ✏️ Update Product
        public async Task<Result<ProductDto>> UpdateAsync(Guid id, ProductUpdateDto dto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return Result<ProductDto>.Failure(new Error(ErrorCodes.NotFound, "Product not found."));

            _mapper.Map(dto, product);
            product.UpdatedAt = DateTime.UtcNow;

            // ✅ If new image is uploaded → upload to BunnyCDN and delete old one
            if (dto.ImageUrl != null && dto.ImageUrl.Length > 0)
            {
                if (!string.IsNullOrEmpty(product.ImageUrl))
                    await _fileUploadService.DeleteFromBunnyCdnAsync(product.ImageUrl);

                var newImageUrl = await _fileUploadService.UploadToBunnyCdnAsync(dto.ImageUrl, "MiniPOS");
                product.ImageUrl = newImageUrl;
            }

            _context.Products.Update(product);
            await _context.SaveChangesAsync();

            var resultDto = _mapper.Map<ProductDto>(product);
            resultDto.ServiceName = (await _context.Services.FindAsync(dto.ServiceId))?.Name;

            return Result<ProductDto>.Success(resultDto);
        }

        // ❌ Delete Product
        public async Task<Result<bool>> DeleteAsync(Guid id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return Result<bool>.Failure(new Error(ErrorCodes.NotFound, "Product not found."));

            // ✅ Delete image from BunnyCDN
            if (!string.IsNullOrEmpty(product.ImageUrl))
                await _fileUploadService.DeleteFromBunnyCdnAsync(product.ImageUrl);

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return Result<bool>.Success(true);
        }

        public async Task<PaginatedResult<ProductDto>> GetPagedAsync(Guid shopId, int pageNumber = 1, int pageSize = 10, string search = null)
        {
            pageNumber = Math.Max(1, pageNumber);
            pageSize = Math.Clamp(pageSize, 1, 100);

            var query = _context.Products
                .Include(p => p.Service)
                    .ThenInclude(s => s.Category)
                .Where(p => p.Service.Category.ShopId == shopId)
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var normalized = search.Trim().ToLower();
                query = query.Where(p =>
                    p.Name.ToLower().Contains(normalized) ||
                    p.Service.Name.ToLower().Contains(normalized) ||
                    p.Service.Category.CategoryName.ToLower().Contains(normalized)
                );
            }

            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            var products = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ProjectTo<ProductDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            return PaginatedResult<ProductDto>.Success(
                items: products,
                pageCount: totalItems,
                pageNumber: pageNumber,
                pageSize: pageSize,
                totalPages: totalPages
            );
        }

    }
}
