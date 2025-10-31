
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using MiniPOS.API.Application.Contracts;
using MiniPOS.API.Application.DTOs.Shop;
using MiniPOS.API.Application.DTOs.ShopUser;
using MiniPOS.API.Common.Constants;
using MiniPOS.API.Common.Results;
using MiniPOS.API.Domain;

namespace MiniPOS.API.Application.Services
{
    public class ShopUserRepository : IShopUserRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public ShopUserRepository(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<Result<IEnumerable<ShopUserDto>>> GetUsersByShopAsync(Guid shopId)
        {
            var shop = await _context.Shops
                .Include(s => s.ShopUsers)
                .ThenInclude(su => su.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == shopId);

            if (shop == null)
                return Result<IEnumerable<ShopUserDto>>.NotFound();

            var shopUsers = shop.ShopUsers;
            var mapped = _mapper.Map<IEnumerable<ShopUserDto>>(shopUsers);

            return Result<IEnumerable<ShopUserDto>>.Success(mapped);
        }

        public async Task<Result<IEnumerable<GetShopDto>>> GetShopsByUserAsync(Guid userId)
        {
            var user = await _context.Users
                .Include(u => u.ShopUsers)
                .ThenInclude(su => su.Shop)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return Result<IEnumerable<GetShopDto>>.BadRequest(new Error(ErrorCodes.BadRequest, "User not found."));

            var shops = user.ShopUsers.Select(su => su.Shop);
            var mapped = _mapper.Map<IEnumerable<GetShopDto>>(shops);

            return Result<IEnumerable<GetShopDto>>.Success(mapped);
        }

        public async Task<Result<IEnumerable<ShopUserDto>>> AssignUsersToShopAsync(Guid shopId, List<Guid> userIds)
        {
            var shop = await _context.Shops
                .Include(s => s.ShopUsers)
                .FirstOrDefaultAsync(s => s.Id == shopId);

            if (shop == null)
                return Result<IEnumerable<ShopUserDto>>.BadRequest(
                    new Error(ErrorCodes.BadRequest, "Shop not found."));

            var existingUserIds = shop.ShopUsers.Select(su => su.UserId).ToHashSet();
            var newUserIds = userIds.Except(existingUserIds).ToList();

            if (!newUserIds.Any())
                return Result<IEnumerable<ShopUserDto>>.Failure(
                    new Error("ShopUser.AlreadyAssigned", "All users are already assigned to this shop.")
                );

            // Add all new ShopUsers
            foreach (var userId in newUserIds)
            {
                _context.ShopUsers.Add(new ShopUser
                {
                    Id = Guid.NewGuid(),
                    ShopId = shopId,
                    UserId = userId
                });
            }

            await _context.SaveChangesAsync();

            // 🧠 Reload new records with full navigation props (Shop + User)
            var newRecords = await _context.ShopUsers
                .Include(su => su.Shop)
                .Include(su => su.User)
                .Where(su => su.ShopId == shopId && newUserIds.Contains(su.UserId))
                .AsNoTracking()
                .ToListAsync();

            // Map them to DTOs
            var mapped = _mapper.Map<IEnumerable<ShopUserDto>>(newRecords);

            return Result<IEnumerable<ShopUserDto>>.Success(mapped);
        }

        public async Task<Result> RemoveUserFromShopAsync(Guid shopId, Guid userId)
        {
            var record = await _context.ShopUsers
                .FirstOrDefaultAsync(su => su.ShopId == shopId && su.UserId == userId);

            if (record == null)
                return Result.NotFound(new Error(ErrorCodes.NotFound, "User not assigned to this shop."));

            _context.ShopUsers.Remove(record);
            await _context.SaveChangesAsync();

            return Result.Success();
        }

        public async Task<Result<bool>> IsUserInShopAsync(Guid shopId, Guid userId)
        {
            var exists = await _context.ShopUsers
                .AnyAsync(su => su.ShopId == shopId && su.UserId == userId);

            return Result<bool>.Success(exists);
        }
    }
}
