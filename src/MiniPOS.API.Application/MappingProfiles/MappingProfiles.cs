using AutoMapper;
using MiniPOS.API.Application.DTOs.Category;
using MiniPOS.API.Application.DTOs.Role;
using MiniPOS.API.Application.DTOs.Shop;
using MiniPOS.API.Application.DTOs.User;
using MiniPOS.API.Domain;

namespace MiniPOS.API.Application
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            CreateMap<CreateCategoryDto, Category>();
            CreateMap<UpdateCategoryDto, Category>();

            // 🏪 Shop Mappings
            CreateMap<Shop, GetShopDto>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.User, opt => opt.MapFrom(src => src.User.FullName));

            CreateMap<CreateShopDto, Shop>();


            CreateMap<UpdateShopDto, Shop>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore());

            // User Mappings
            CreateMap<CreateUserDto, ApplicationUser>();
            CreateMap<UpdateUserDto, ApplicationUser>();

            CreateMap<ApplicationUser, GetUserDto>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.Name));

            // Role Mappings
            CreateMap<ApplicationRole, GetRoleDto>()
                .ForMember(
                    dest => dest.Permissions,
                    opt => opt.MapFrom(src => src.RolePermissions.Select(rp => new PermissionDto
                    {
                        Id = rp.Permission.Id,
                        Name = rp.Permission.Name
                    })));
            CreateMap<CreateRoleDto, ApplicationRole>();
            CreateMap<UpdateRoleDto, ApplicationRole>()
                .ForMember(dest => dest.NormalizedName,
                        opt => opt.MapFrom(src => src.Name.ToUpper()))
                .ForMember(dest => dest.RolePermissions, opt => opt.Ignore());

            // Permisson Mappings
            CreateMap<Permission, PermissionDto>();



        }
    }
}