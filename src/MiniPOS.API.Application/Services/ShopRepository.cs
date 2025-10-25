using AutoMapper;
using AutoMapper.QueryableExtensions;
using MiniPOS.API.Application.Contracts;
using MiniPOS.API.Application.DTOs.Shop;
using MiniPOS.API.Common.Results;
using MiniPOS.API.Domain;
using Microsoft.EntityFrameworkCore;

namespace MiniPOS.API.Application.Services
{
    public class ShopRepository : IShopRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public ShopRepository(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<PaginatedResult<GetShopDto>> GetAllAsync(int page, int pageSize, Guid userId, bool isSuperAdmin)
        {
            var query = _context.Shops.Include(s => s.User).AsQueryable();

            if (!isSuperAdmin)
                query = query.Where(s => s.UserId == userId);

            var total = await query.CountAsync();

            // ✅ Use AutoMapper’s ProjectTo for efficient projection
            var shops = await query
                .OrderByDescending(s => s.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ProjectTo<GetShopDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            return PaginatedResult<GetShopDto>.Success(shops, total, page, pageSize);
        }

        public async Task<Result<GetShopDto>> GetByIdAsync(Guid id)
        {
            var shop = await _context.Shops.Include(s => s.User)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (shop == null)
                return Result<GetShopDto>.NotFound("Shop not found");

            var dto = _mapper.Map<GetShopDto>(shop);
            return Result<GetShopDto>.Success(dto);
        }

        public async Task<Result<GetShopDto>> CreateAsync(CreateShopDto dto)
        {
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null)
                return Result<GetShopDto>.NotFound("Owner not found");

            var shop = _mapper.Map<Shop>(dto);
            shop.UserId = user.Id;  // ✅ assign only foreign key
                                    // DO NOT set shop.User = user

            _context.Shops.Add(shop);
            await _context.SaveChangesAsync();

            // Optional: include owner info in response
            var result = _mapper.Map<GetShopDto>(shop);
            result.OwnerName = user.FullName;

            return Result<GetShopDto>.Success(result);
        }


        public async Task<Result<GetShopDto>> UpdateAsync(Guid id, UpdateShopDto dto)
        {
            var shop = await _context.Shops.Include(s => s.User)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (shop == null)
                return Result<GetShopDto>.NotFound("Shop not found");     

            await _context.SaveChangesAsync();

            var result = _mapper.Map<GetShopDto>(shop);
            return Result<GetShopDto>.Success(result);
        }

        public async Task<Result<bool>> DeleteAsync(Guid id)
        {
            var shop = await _context.Shops.FindAsync(id);
            if (shop == null)
                return Result<bool>.NotFound("Shop not found");

            _context.Shops.Remove(shop);
            await _context.SaveChangesAsync();

            return Result<bool>.Success(true);
        }
    }
}
