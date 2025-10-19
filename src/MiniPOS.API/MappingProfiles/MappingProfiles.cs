using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using MiniPOS.Data;
using MiniPOS.DTOs.Auth;
using MiniPOS.DTOs.Category;
using MiniPOS.DTOs.Store;
using MiniPOS.DTOs.User;

namespace MiniPOS.MappingProfiles
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