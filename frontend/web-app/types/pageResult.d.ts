export type PageResult<T> = {
    items: T[];
    pageCount: number;
    pageNumber?: number;
    pageSize?: number;
    totalPages: number;
}