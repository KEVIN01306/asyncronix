import type { ApiResponse, PaginatedResponse } from "../../../../core/api/interfaces/api-response.interface";

export interface Categoria {
    id: string;
    categoria: string;
    default_categoria: boolean;
    activo: boolean;
}

export type CategoriaDetailResponse = ApiResponse<Categoria>;

export type CategoriasResponse = PaginatedResponse<Categoria>;