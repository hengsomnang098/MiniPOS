using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
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
        private readonly ILogger<ServiceRepository> _logger;

        public ServiceRepository(ApplicationDbContext context, IMapper mapper, ILogger<ServiceRepository> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        #region Create
        public async Task<Result<GetServiceDto>> CreateServiceAsync(CreateServiceDto createServiceDto)
        {
            _logger.LogInformation("Creating new service {ServiceName} for category {CategoryId}",
                createServiceDto.Name, createServiceDto.CategoryId);

            try
            {
                var service = _mapper.Map<Service>(createServiceDto);
                await _context.Services.AddAsync(service);
                await _context.SaveChangesAsync();

                // ✅ Force fresh DB query (ignore local cache)
                var result = await _context.Services
                    .AsNoTracking()
                    .Where(s => s.Id == service.Id)
                    .ProjectTo<GetServiceDto>(_mapper.ConfigurationProvider)
                    .FirstOrDefaultAsync();

                if (result == null)
                {
                    _logger.LogWarning("Service creation succeeded but retrieval failed for ID {ServiceId}", service.Id);
                    return Result<GetServiceDto>.Failure(new Error(ErrorCodes.BadRequest, "Service creation failed."));
                }

                _logger.LogInformation("Service created successfully with ID {ServiceId}", service.Id);
                return Result<GetServiceDto>.Success(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating service {ServiceName}", createServiceDto.Name);
                return Result<GetServiceDto>.Failure(new Error("ServiceCreationFailed", "An unexpected error occurred while creating the service."));
            }
        }
        #endregion

        #region Update
        public async Task<Result<GetServiceDto>> UpdateServiceAsync(UpdateServiceDto updateServiceDto, Guid id)
        {

            if (id != updateServiceDto.Id)
                return Result<GetServiceDto>.Failure(new Error(ErrorCodes.BadRequest, "Mismatched Service ID."));

            try
            {
                var service = await _context.Services.FindAsync(id);
                if (service == null)
                {
                    _logger.LogWarning("⚠️ Service with ID {ServiceId} not found for update", id);
                    return Result<GetServiceDto>.Failure(new Error(ErrorCodes.NotFound, "Service not found."));
                }

                // Map and force EF to detect changes
                _mapper.Map(updateServiceDto, service);
                _context.Entry(service).State = EntityState.Modified;

                await _context.SaveChangesAsync();

                // Reload fresh data from DB
                var result = await _context.Services
                    .AsNoTracking()
                    .Where(s => s.Id == id)
                    .ProjectTo<GetServiceDto>(_mapper.ConfigurationProvider)
                    .FirstOrDefaultAsync();

                _logger.LogInformation("✅ Service updated successfully: {@UpdatedService}", result);
                return Result<GetServiceDto>.Success(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "💥 Error occurred while updating service {@UpdateServiceDto}", updateServiceDto);
                return Result<GetServiceDto>.Failure(new Error("ServiceUpdateFailed", "An error occurred while updating the service."));
            }
        }

        #endregion

        #region Delete
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

                // ✅ Optional: Verify deletion
                var exists = await _context.Services.AsNoTracking().AnyAsync(s => s.Id == id);
                if (exists)
                {
                    _logger.LogWarning("Service with ID {ServiceId} still exists after deletion attempt", id);
                    return Result<bool>.Failure(new Error("ServiceDeletionFailed", "Deletion was not successful."));
                }

                _logger.LogInformation("Service with ID {ServiceId} deleted successfully", id);
                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting service with ID {ServiceId}", id);
                return Result<bool>.Failure(new Error("ServiceDeletionFailed", "An error occurred while deleting the service."));
            }
        }
        #endregion

        #region GetAll
        public async Task<PaginatedResult<GetServiceDto>> GetAllAsync(Guid shopId, int page, int pageSize, string search = null)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);

            var query = _context.Services
                .AsNoTracking()
                .Where(s => s.Category.ShopId == shopId); // ✅ Filter early

            if (!string.IsNullOrWhiteSpace(search))
            {
                string keyword = search.Trim().ToLower();
                query = query.Where(s =>
                    EF.Functions.Like(s.Name.ToLower(), $"%{keyword}%") ||
                    EF.Functions.Like(s.Category.CategoryName.ToLower(), $"%{keyword}%"));
            }

            var total = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(total / (double)pageSize);

            var services = await query
                .Where(s => s.Category.ShopId == shopId)
                .OrderBy(s => s.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ProjectTo<GetServiceDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            return PaginatedResult<GetServiceDto>.Success(
                items: services,
                pageCount: total,
                pageNumber: page,
                pageSize: pageSize,
                totalPages: totalPages
            );
        }
        #endregion

        #region GetById
        public async Task<Result<GetServiceDto>> GetByIdAsync(Guid id)
        {
            var service = await _context.Services
                .AsNoTracking()
                .OrderBy(r=>r.CreatedAt)
                .Where(s => s.Id == id)
                .ProjectTo<GetServiceDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync();

            if (service == null)
                return Result<GetServiceDto>.Failure(new Error(ErrorCodes.NotFound, "Service not found."));

            return Result<GetServiceDto>.Success(service);
        }
        #endregion
    }
}
