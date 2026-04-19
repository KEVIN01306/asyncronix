export interface ApiResponse<T> {
    status: 'success' | 'error';
    message: string;
    data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    count: number;
    meta: {
        total: number;
        limit: number;
        offset: number;
    };
}