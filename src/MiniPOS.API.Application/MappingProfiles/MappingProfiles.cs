using AutoMapper;
using MiniPOS.API.Application.DTOs.Category;
using MiniPOS.API.Application.DTOs.Role;
using MiniPOS.API.Application.DTOs.Shop;
using MiniPOS.API.Application.DTOs.ShopUser;
using MiniPOS.API.Application.DTOs.User;
using MiniPOS.API.Domain;

namespace MiniPOS.API.Application
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            // 🧭 Category Mappings
            CreateMap<CreateCategoryDto, Category>();
            CreateMap<UpdateCategoryDto, Category>();

            // 👥 ShopUser Mappings
            CreateMap<ShopUser, ShopUserDto>()
      .ForMember(dest => dest.Shop, opt => opt.MapFrom(src => src.Shop.Name))
      .ForMember(dest => dest.User, opt => opt.MapFrom(src => src.User.FullName));

            CreateMap<ShopUserCreateDto, ShopUser>()
                .ForMember(dest => dest.UserId, opt => opt.Ignore()) // since ShopUserCreateDto.UserId[] is multiple
                .ForMember(dest => dest.ShopId, opt => opt.MapFrom(src => src.ShopId));

            // 🏪 Shop Mappings
            CreateMap<Shop, GetShopDto>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.User, opt => opt.MapFrom(src => src.User != null ? src.User.FullName : string.Empty));

            CreateMap<CreateShopDto, Shop>();

            CreateMap<UpdateShopDto, Shop>()
                .ForMember(dest => dest.Id, opt => opt.Ignore()) // prevent ID overwrite
                .ForMember(dest => dest.UserId, opt => opt.Ignore()); // user is set elsewhere (e.g., from auth context)

            // 👤 User Mappings
            CreateMap<CreateUserDto, ApplicationUser>();
            CreateMap<UpdateUserDto, ApplicationUser>();

            CreateMap<ApplicationUser, GetUserDto>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role != null ? src.Role.Name : string.Empty));

            // 🔐 Role Mappings
            CreateMap<ApplicationRole, GetRoleDto>()
                .ForMember(dest => dest.Permissions,
                    opt => opt.MapFrom(src =>
                        src.RolePermissions.Select(rp => new PermissionDto
                        {
                            Id = rp.Permission.Id,
                            Name = rp.Permission.Name
                        })));

            CreateMap<CreateRoleDto, ApplicationRole>();

            CreateMap<UpdateRoleDto, ApplicationRole>()
                .ForMember(dest => dest.NormalizedName, opt => opt.MapFrom(src => src.Name.ToUpper()))
                .ForMember(dest => dest.RolePermissions, opt => opt.Ignore());

            // ⚙️ Permission Mappings
            CreateMap<Permission, PermissionDto>();
        }
    }
}
