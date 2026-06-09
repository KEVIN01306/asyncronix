import type { ApiResponse, PaginatedResponse } from "../../../../core/api/interfaces/api-response.interface";

export interface ProductoCategoria {
    id: string;
    categoria: string;
}

export interface VarianteValor {
    id: string;
    atributo_id: string;
    valor: string;
    atributo?: {
        id: string;
        nombre: string;
    };
}

export interface Variante {
    id: string;
    url_imagen?: string;
    sku?: string;
    codigo_barras?: string | null;
    qr_codigo?: string | null;
    precio_sugerido?: number;
    stock_total?: number;
    valores?: VarianteValor[];
    producto?: {
        id: string;
        nombre: string;
    };
}

export interface Producto {
    id: string;
    categoria_id: string;
    nombre: string;
    codigo?: string | null;
    sku: string;
    precio_sugerido: number;
    stock_total: number;
    url_imagen: string;
    qr_imagen?: string | null;
    activo: boolean;
    categoria: ProductoCategoria | null;
    variantes?: Variante[];
}

export type ProductoDetailResponse = ApiResponse<Producto>;
export type ProductosResponse = PaginatedResponse<Producto>;
