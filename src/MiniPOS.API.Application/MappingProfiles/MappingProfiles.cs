using AutoMapper;
using MiniPOS.API.Application.DTOs.Category;
using MiniPOS.API.Application.DTOs.Role;
using MiniPOS.API.Application.DTOs.Service;
using MiniPOS.API.Application.DTOs.Shop;
using MiniPOS.API.Application.DTOs.ShopUser;
using MiniPOS.API.Application.DTOs.User;
using MiniPOS.API.Application.DTOs.Product;
using MiniPOS.API.Domain;

namespace MiniPOS.API.Application
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            // 🏷️ Category Mappings
            CreateMap<Category, GetCategoryDto>()
                .ForMember(dest => dest.ShopId, opt => opt.MapFrom(src => src.ShopId))
                .ForMember(dest => dest.Shop, opt => opt.MapFrom(src => src.Shop != null ? src.Shop.Name : string.Empty));

            CreateMap<CreateCategoryDto, Category>()
                .ForMember(dest => dest.ShopId, opt => opt.MapFrom(src => src.ShopId))
                .ForMember(dest => dest.Id, opt => opt.Ignore()); // EF handles PK

            CreateMap<UpdateCategoryDto, Category>()
                .ForMember(dest => dest.ShopId, opt => opt.MapFrom(src => src.ShopId))
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            // ⚙️ Service Mappings
            CreateMap<Service, GetServiceDto>()
                .ForMember(dest => dest.CategoryId, opt => opt.MapFrom(src => src.CategoryId))
                .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category != null ? src.Category.CategoryName : string.Empty));

            CreateMap<CreateServiceDto, Service>()
                .ForMember(dest => dest.CategoryId, opt => opt.MapFrom(src => src.CategoryId))
                .ForMember(dest => dest.Id, opt => opt.Ignore()); // EF creates PK

            CreateMap<UpdateServiceDto, Service>()
                .ForMember(dest => dest.Id, opt => opt.Ignore()) // prevent PK overwrite
                .ForMember(dest => dest.CategoryId, opt => opt.MapFrom(src => src.CategoryId))
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            // 🛒 Product Mappings
            CreateMap<Product, ProductDto>()
                .ForMember(dest => dest.ServiceName, opt => opt.MapFrom(src => src.Service.Name))
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Service.Category.CategoryName))
                .ForMember(dest => dest.CategoryId, opt => opt.MapFrom(src => src.Service.Category.Id))
                .ReverseMap();

            CreateMap<ProductCreateDto, Product>()
                .ForMember(dest => dest.Id, opt => opt.Ignore()) // let EF handle Id
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore()) // handled automatically
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

            CreateMap<ProductUpdateDto, Product>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            // 👥 ShopUser Mappings
            CreateMap<ShopUser, ShopUserDto>()
                .ForMember(dest => dest.Shop, opt => opt.MapFrom(src => src.Shop != null ? src.Shop.Name : string.Empty))
                .ForMember(dest => dest.User, opt => opt.MapFrom(src => src.User != null ? src.User.FullName : string.Empty));

            CreateMap<ShopUserCreateDto, ShopUser>()
                .ForMember(dest => dest.UserId, opt => opt.Ignore()) // multiple UserIds
                .ForMember(dest => dest.ShopId, opt => opt.MapFrom(src => src.ShopId));

            // 🏪 Shop Mappings
            CreateMap<Shop, GetShopDto>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.User, opt => opt.MapFrom(src => src.User != null ? src.User.FullName : string.Empty));

            CreateMap<CreateShopDto, Shop>();

            CreateMap<UpdateShopDto, Shop>()
                .ForMember(dest => dest.Id, opt => opt.Ignore()) // no PK overwrite
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore()) // never change
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

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
