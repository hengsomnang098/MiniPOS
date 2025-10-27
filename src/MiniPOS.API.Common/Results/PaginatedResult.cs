using MiniPOS.API.Common.Results;
using System;
using System.Collections.Generic;

namespace MiniPOS.API.Common.Results;

public readonly record struct PaginatedResult<T>
{
    public bool IsSuccess { get; }
    public List<T>? Items { get; }
    public int PageCount { get; }
    public int PageNumber { get; }
    public int PageSize { get; }
    public int TotalPages { get; }
    public Error[] Errors { get; }

    public bool HasNextPage => IsSuccess && PageNumber < TotalPages;
    public bool HasPreviousPage => IsSuccess && PageNumber > 1;

    private PaginatedResult(
        bool isSuccess,
        List<T>? items,
        int pageCount,
        int pageNumber,
        int pageSize,
        int totalPages,
        Error[] errors)
        => (IsSuccess, Items, PageCount, PageNumber, PageSize, TotalPages, Errors)
            = (isSuccess, items, pageCount, pageNumber, pageSize, totalPages, errors);

    public static PaginatedResult<T> Success(
        List<T> items,
        int pageCount,
        int pageNumber,
        int pageSize,
        int totalPages)
        => new(true, items, pageCount, pageNumber, pageSize, totalPages, Array.Empty<Error>());

    public static PaginatedResult<T> Failure(params Error[] errors)
        => new(false, null, 0, 0, 0, 0, errors);

    public static PaginatedResult<T> NotFound(params Error[] errors)
        => new(false, null, 0, 0, 0, 0, errors);

    public static PaginatedResult<T> BadRequest(params Error[] errors)
        => new(false, null, 0, 0, 0, 0, errors);

    // Functional helpers
    public PaginatedResult<K> Map<K>(Func<T, K> map)
        => IsSuccess && Items != null
            ? PaginatedResult<K>.Success(
                Items.ConvertAll<K>(new Converter<T, K>(map)),
                PageCount,
                PageNumber,
                PageSize,
                TotalPages)
            : PaginatedResult<K>.Failure(Errors);

    public PaginatedResult<K> Bind<K>(Func<List<T>, PaginatedResult<K>> next)
        => IsSuccess && Items != null ? next(Items) : PaginatedResult<K>.Failure(Errors);

    public PaginatedResult<T> Ensure(Func<List<T>, bool> predicate, Error error)
        => IsSuccess && Items != null && !predicate(Items) ? Failure(error) : this;
}
