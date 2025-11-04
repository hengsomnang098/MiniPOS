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

        // 🔎 Get product by Barcode within a Shop scope
        public async Task<Result<ProductDto>> GetByBarcodeAsync(Guid shopId, string barcode)
        {
            if (string.IsNullOrWhiteSpace(barcode))
                return Result<ProductDto>.Failure(new Error(ErrorCodes.BadRequest, "Barcode is required."));

            var normalized = barcode.Trim();

            var product = await _context.Products
                .Include(p => p.Service)
                    .ThenInclude(s => s.Category)
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Barcode == normalized && p.ShopId == shopId);

            if (product == null)
                return Result<ProductDto>.Failure(new Error(ErrorCodes.NotFound, "Product not found for this barcode."));

            var dto = _mapper.Map<ProductDto>(product);
            dto.ServiceName = product.Service?.Name;
            dto.CategoryName = product.Service?.Category?.CategoryName;
            dto.CategoryId = product.Service?.Category?.Id;

            return Result<ProductDto>.Success(dto);
        }

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

            // Normalize barcode (optional field)
            if (!string.IsNullOrWhiteSpace(product.Barcode))
                product.Barcode = product.Barcode.Trim();

            // Resolve ShopId from Service -> Category -> Shop
            var shopId = await _context.Services
                .Where(s => s.Id == dto.ServiceId)
                .Select(s => s.Category.ShopId)
                .FirstOrDefaultAsync();

            if (shopId == Guid.Empty)
            {
                _logger.LogWarning("⚠️ ShopId could not be resolved from ServiceId: {ServiceId}", dto.ServiceId);
                return Result<ProductDto>.Failure(new Error(ErrorCodes.NotFound, "Shop not found for the provided ServiceId."));
            }

            product.ShopId = shopId;

            // Pre-check uniqueness to avoid orphaning uploaded images
            if (!string.IsNullOrWhiteSpace(product.Barcode))
            {
                var exists = await _context.Products.AnyAsync(p => p.ShopId == shopId && p.Barcode == product.Barcode);
                if (exists)
                {
                    return Result<ProductDto>.Failure(new Error(ErrorCodes.Conflict, "Barcode already exists in this shop."));
                }
            }

            // ✅ Handle BunnyCDN Image Upload (if present)
            if (dto.ImageUrl != null && dto.ImageUrl.Length > 0)
            {
                _logger.LogInformation("🖼 Uploading image to BunnyCDN for product: {Name}", dto.Name);
                var imageUrl = await _fileUploadService.UploadToBunnyCdnAsync(dto.ImageUrl, "MiniPOS");
                product.ImageUrl = imageUrl;
            }

            _context.Products.Add(product);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                // Handle unique constraint on Barcode
                if (ex.InnerException?.Message?.Contains("IX_Product_ShopId_Barcode") == true || ex.Message.Contains("IX_Product_ShopId_Barcode")
                    || ex.InnerException?.Message?.Contains("IX_Product_Barcode") == true || ex.Message.Contains("IX_Product_Barcode"))
                {
                    return Result<ProductDto>.Failure(new Error(ErrorCodes.Conflict, "Barcode already exists in this shop."));
                }
                throw;
            }

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

            // Map incoming changes (excluding barcode normalization and shop/service resolution)
            _mapper.Map(dto, product);
            product.UpdatedAt = DateTime.UtcNow;

            // Normalize barcode
            if (!string.IsNullOrWhiteSpace(product.Barcode))
                product.Barcode = product.Barcode.Trim();

            // Re-resolve ShopId in case Service changed
            var newShopId = await _context.Services
                .Where(s => s.Id == product.ServiceId)
                .Select(s => s.Category.ShopId)
                .FirstOrDefaultAsync();

            if (newShopId == Guid.Empty)
            {
                return Result<ProductDto>.Failure(new Error(ErrorCodes.NotFound, "Shop not found for the provided ServiceId."));
            }
            product.ShopId = newShopId;

            // Pre-check uniqueness when barcode is provided
            if (!string.IsNullOrWhiteSpace(product.Barcode))
            {
                var exists = await _context.Products.AnyAsync(p => p.Id != id && p.ShopId == newShopId && p.Barcode == product.Barcode);
                if (exists)
                {
                    return Result<ProductDto>.Failure(new Error(ErrorCodes.Conflict, "Barcode already exists in this shop."));
                }
            }

            // ✅ If new image is uploaded → upload to BunnyCDN and delete old one
            if (dto.ImageUrl != null && dto.ImageUrl.Length > 0)
            {
                if (!string.IsNullOrEmpty(product.ImageUrl))
                    await _fileUploadService.DeleteFromBunnyCdnAsync(product.ImageUrl);

                var newImageUrl = await _fileUploadService.UploadToBunnyCdnAsync(dto.ImageUrl, "MiniPOS");
                product.ImageUrl = newImageUrl;
            }

            _context.Products.Update(product);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException?.Message?.Contains("IX_Product_ShopId_Barcode") == true || ex.Message.Contains("IX_Product_ShopId_Barcode")
                    || ex.InnerException?.Message?.Contains("IX_Product_Barcode") == true || ex.Message.Contains("IX_Product_Barcode"))
                {
                    return Result<ProductDto>.Failure(new Error(ErrorCodes.Conflict, "Barcode already exists in this shop."));
                }
                throw;
            }

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

        public async Task<PaginatedResult<ProductDto>> GetPagedAsync(Guid shopId, int pageNumber = 1, int pageSize = 10, string search = null, Guid? categoryId = null)
        {
            pageNumber = Math.Max(1, pageNumber);
            pageSize = Math.Clamp(pageSize, 1, 100);

            var query = _context.Products
                .Include(p => p.Service)
                    .ThenInclude(s => s.Category)
                .Where(p => p.ShopId == shopId)
                .AsNoTracking();

            if (categoryId.HasValue && categoryId.Value != Guid.Empty)
            {
                query = query.Where(p => p.Service.CategoryId == categoryId.Value);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var normalized = search.Trim().ToLower();
                query = query.Where(p =>
                    p.Name.ToLower().Contains(normalized) ||
                    p.Service.Name.ToLower().Contains(normalized) ||
                    p.Service.Category.CategoryName.ToLower().Contains(normalized) ||
                    (p.Barcode != null && p.Barcode.ToLower().Contains(normalized))
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
