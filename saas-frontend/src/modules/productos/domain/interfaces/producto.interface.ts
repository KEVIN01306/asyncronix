import type { ApiResponse, PaginatedResponse } from "../../../../core/api/interfaces/api-response.interface";

export interface ProductoCategoria {
    id: string;
    categoria: string;
}

export interface Producto {
    id: string;
    categoria_id: string;
    nombre: string;
    codigo?: string | null;
    precio_sugerido: number;
    stock_total: number;
    url_imagen: string;
    activo: boolean;
    categoria: ProductoCategoria | null;
}

export type ProductoDetailResponse = ApiResponse<Producto>;
export type ProductosResponse = PaginatedResponse<Producto>;
