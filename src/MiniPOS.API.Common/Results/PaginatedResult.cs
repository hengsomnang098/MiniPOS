using System.Collections.Generic;

namespace MiniPOS.API.Common.Results
{
    public class PaginatedResult<T>
    {
        public List<T> Items { get; set; }
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public bool IsSuccess { get; set; }
        public string? Error { get; set; }

        public PaginatedResult(List<T> items, int totalCount, int page, int pageSize)
        {
            Items = items;
            TotalCount = totalCount;
            Page = page;
            PageSize = pageSize;
            IsSuccess = true;
        }

        public static PaginatedResult<T> Success(List<T> items, int totalCount, int page, int pageSize)
            => new(items, totalCount, page, pageSize);

        public static PaginatedResult<T> Failure(string error)
            => new(new List<T>(), 0, 1, 10) { IsSuccess = false, Error = error };
    }
}
