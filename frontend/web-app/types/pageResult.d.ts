export interface PageResult<T> {
    isSuccess: boolean;
    items: T[];
    pageCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    errors?: string[];
}
