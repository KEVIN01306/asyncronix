import type { ApiResponse, PaginatedResponse } from "../../../../core/api/interfaces/api-response.interface";


export interface Categoria {
    id: string;
    nombre: string;
    descripcion: string;
}

export type CategoriaDetailResponse = ApiResponse<Categoria>;

export type CategoriasResponse = PaginatedResponse<Categoria>;