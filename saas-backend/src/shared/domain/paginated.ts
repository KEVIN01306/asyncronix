export interface Paginated<T> {
    data: T[]
    total: number
    page: number
    perPage: number
}