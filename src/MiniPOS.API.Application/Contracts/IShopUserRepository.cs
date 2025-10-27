using MiniPOS.API.Application.DTOs.Shop;
using MiniPOS.API.Application.DTOs.ShopUser;
using MiniPOS.API.Application.DTOs.User;
using MiniPOS.API.Common.Results;

namespace MiniPOS.API.Application.Contracts
{
    public interface IShopUserRepository
    {
        Task<Result<IEnumerable<ShopUserDto>>> GetUsersByShopAsync(Guid shopId);
        Task<Result<IEnumerable<GetShopDto>>> GetShopsByUserAsync(Guid userId);
        Task<Result<IEnumerable<ShopUserDto>>> AssignUsersToShopAsync(Guid shopId, List<Guid> userIds);
        Task<Result> RemoveUserFromShopAsync(Guid shopId, Guid userId);
        Task<Result<bool>> IsUserInShopAsync(Guid shopId, Guid userId);
    }
}