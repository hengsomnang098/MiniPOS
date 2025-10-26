public class PaginatedResult<T>
{
    public required List<T> Items { get; set; }
    public int PageCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }

    public bool HasNextPage => PageNumber < TotalPages;
    public bool HasPreviousPage => PageNumber > 1;

    public static PaginatedResult<T> Success(
        List<T> items, int pageCount, int pageNumber, int pageSize, int totalPages)
    {
        return new PaginatedResult<T>
        {
            Items = items,
            PageCount = pageCount,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalPages = totalPages
        };
    }
}
