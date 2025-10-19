using AutoMapper;
using MiniPOS.API.Application.DTOs.Category;
using MiniPOS.API.Application.DTOs.Store;
using MiniPOS.API.Application.DTOs.User;
using MiniPOS.API.Domain;

namespace MiniPOS.API.Application
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            // Store Mappings
            CreateMap<Store, GetStoreDto>();
            CreateMap<CreateStoreDto, Store>();
            CreateMap<UpdateStoreDto, Store>();

            // Category Mappings
            CreateMap<Category, GetCategoryDto>().ForMember(
                dest => dest.Store,
                opt => opt.MapFrom(src => src.Store.StoreName)
            );
            CreateMap<CreateCategoryDto, Category>();
            CreateMap<UpdateCategoryDto, Category>();

            // User Mappings
            CreateMap<CreateUserDto, ApplicationUser>();
            CreateMap<UpdateUserDto, ApplicationUser>();

            CreateMap<ApplicationUser, GetUserDto>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.Name));
            
            
            
        }
    }
}