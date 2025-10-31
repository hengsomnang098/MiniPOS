

using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using MiniPOS.API.Application.Contracts;
using MiniPOS.API.Application.DTOs.Service;
using MiniPOS.API.Common.Constants;
using MiniPOS.API.Common.Results;
using MiniPOS.API.Domain;

namespace MiniPOS.API.Application.Services
{
    public class ServiceRepository : IServiceRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;
        private readonly ILogger<ServiceRepository> _logger;
        public ServiceRepository(ApplicationDbContext context, IMapper mapper, IMemoryCache cache, ILogger<ServiceRepository> logger)
        {
            _context = context;
            _mapper = mapper;
            _cache = cache;
            _logger = logger;
        }

        private static string GetCacheKeyForService(Guid id) => $"service_{id}";
        private static string GetCacheKeyForAllServices() => $"services_all";

        public async Task<Result<GetServiceDto>> CreateServiceAsync(CreateServiceDto createServiceDto)
        {
            _logger.LogInformation("Creating new service {ServiceName} for category {CategoryId}", createServiceDto.Name, createServiceDto.CategoryId);
            var service = _mapper.Map<Service>(createServiceDto);
            await _context.Services.AddAsync(service);
            await _context.SaveChangesAsync();

            // ✅ Clear cache for all services
            _cache.Remove(GetCacheKeyForAllServices());

            var serviceWithCategory = await _context.Services
                .Where(s => s.Id == service.Id)
                .Include(s => s.Category)
                .FirstOrDefaultAsync(r => r.Id == service.Id);
            // .ProjectTo<GetServiceDto>(_mapper.ConfigurationProvider)
            // .FirstAsync();

            _cache.Set(GetCacheKeyForService(service.Id), serviceWithCategory, TimeSpan.FromMinutes(10));

            var result = _mapper.Map<GetServiceDto>(serviceWithCategory);
            return result != null
                ? Result<GetServiceDto>.Success(result)
                : Result<GetServiceDto>.Failure(new Error(ErrorCodes.BadRequest, "Service creation failed."));
        }

        public async Task<Result<bool>> DeleteAsync(Guid id)
        {
            try
            {
                var service = await _context.Services.FindAsync(id);
                if (service == null)
                {
                    _logger.LogWarning("Service with ID {ServiceId} not found for deletion", id);
                    return Result<bool>.NotFound();
                }
                _context.Services.Remove(service);
                await _context.SaveChangesAsync();
                // ✅ Clear cache for this service and all services
                _cache.Remove(GetCacheKeyForService(id));
                _cache.Remove(GetCacheKeyForAllServices());
                _logger.LogInformation("Service with ID {ServiceId} deleted successfully", id);
                return Result<bool>.Success(true);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting service with ID {ServiceId}", id);
                return Result<bool>.Failure(new Error("ServiceDeletionFailed", "An error occurred while deleting the service."));
            }
        }

        public async Task<Result<IEnumerable<GetServiceDto>>> GetAllAsync()
        {
            var services = await _context.Services
                .Include(s => s.Category)
                .AsNoTracking()
                .ProjectTo<GetServiceDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            return Result<IEnumerable<GetServiceDto>>.Success(services);
        }

        public async Task<Result<GetServiceDto>> GetByIdAsync(Guid id)
        {
            var service = await _context.Services
                .AsNoTracking()
                .Include(s => s.Category)
                .Where(s => s.Id == id)
                .ProjectTo<GetServiceDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync();

            return service != null
                ? Result<GetServiceDto>.Success(service)
                : Result<GetServiceDto>.Failure(new Error(ErrorCodes.NotFound, "Service not found."));
        }

        public async Task<Result<GetServiceDto>> UpdateServiceAsync(UpdateServiceDto updateServiceDto, Guid id)
        {
            if (id != updateServiceDto.Id)
            {
                return Result<GetServiceDto>.Failure(new Error(ErrorCodes.NotFound, "Mismatched Service ID."));
            }
            
            var service = await _context.Services.FindAsync(id);
            if (service == null)
            {
                return Result<GetServiceDto>.Failure(new Error(ErrorCodes.NotFound, "Service not found."));
            }
            _mapper.Map(updateServiceDto, service);
            _context.Services.Update(service);
            await _context.SaveChangesAsync();

            var result = await _context.Services
                .Where(s => s.Id == service.Id)
                .Include(s => s.Category)
                .ProjectTo<GetServiceDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync();

            return result != null
                ? Result<GetServiceDto>.Success(result)
                : Result<GetServiceDto>.Failure(new Error(ErrorCodes.NotFound, "Service not found."));
        }
    }
}