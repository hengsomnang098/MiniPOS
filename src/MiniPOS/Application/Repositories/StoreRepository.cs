using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using MiniPOS.Application.Interfaces;
using MiniPOS.Constants;
using MiniPOS.Data;
using MiniPOS.DTOs.Store;
using MiniPOS.Results;

namespace MiniPOS.Application.Repositories
{
    public class StoreRepository : IStoreRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public StoreRepository(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        public async Task<Result<GetStoreDto>> CreateAsync(CreateStoreDto createDto)
        {
            try
            {

                var store = _mapper.Map<Store>(createDto);

                _context.Stores.Add(store);
                await _context.SaveChangesAsync();

                var storeDto = await _context.Stores
                    .Where(s => s.Id == store.Id)
                    .ProjectTo<GetStoreDto>(_mapper.ConfigurationProvider)
                    .FirstAsync();

                return Result<GetStoreDto>.Success(storeDto);
            }
            catch
            {
                return Result<GetStoreDto>.Failure(new Error(ErrorCodes.Failure, "An unexpected error occurred while creating the country."));
            }
        }

        public async Task<Result> DeleteAsync(Guid id)
        {
            var store = await _context.Stores.FindAsync(id);
            if (store == null)
            {
                return Result.NotFound(new Error(ErrorCodes.NotFound, "Store not found."));
            }

            _context.Stores.Remove(store);
            await _context.SaveChangesAsync();

            return Result.Success();
        }

        public async Task<Result<IEnumerable<GetStoreDto>>> GetAllAsync()
        {
            var stores = await _context.Stores
                .ProjectTo<GetStoreDto>(_mapper.ConfigurationProvider)
                .ToListAsync();
            return Result<IEnumerable<GetStoreDto>>.Success(stores);
        }

        public async Task<Result<GetStoreDto>> GetDetailsAsync(Guid id)
        {
            var store = await _context.Stores
                .Where(s => s.Id == id)
                .ProjectTo<GetStoreDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync();

            return store != null
                ? Result<GetStoreDto>.Success(store)
                : Result<GetStoreDto>.Failure(new Error(ErrorCodes.NotFound, "Store not found."));
        }

        public async Task<bool> StoreExistAsync(Guid id)
        {
            return await _context.Stores.AnyAsync(s => s.Id == id);
        }

        public async Task<bool> StoreExistAsync(string name)
        {
            return await _context.Stores.AnyAsync(s => s.StoreName.ToLower().Trim() == name.ToLower().Trim());
        }

        public async Task<Result> UpdateAsync(Guid id, UpdateStoreDto updateDto)
        {
            if (id != updateDto.Id)
            {
                return Result.BadRequest(new Error(ErrorCodes.BadRequest, "Mismatched Store ID."));
            }

            var store = await _context.Stores.FindAsync(id);
            if (store == null)
            {
                return Result.NotFound(new Error(ErrorCodes.NotFound, $"Store '{id}' not found."));
            }

            _mapper.Map(updateDto, store);
            await _context.SaveChangesAsync();

            return Result.Success();
        }
    }
}