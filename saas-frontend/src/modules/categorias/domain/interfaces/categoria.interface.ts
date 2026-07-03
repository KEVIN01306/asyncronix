import type { ApiResponse, PaginatedResponse } from "../../../../core/api/interfaces/api-response.interface";

export interface CategoriaPadre {
    id: string;
    categoria: string;
    default_categoria: boolean;
}

export interface Categoria {
    id: string;
    categoria: string;
    default_categoria: boolean;
    activo: boolean;
    categoria_padre_id?: string;
    categoria_padre?: CategoriaPadre;
    subcategorias?: Categoria[];
}

export interface CategoriaJerarquia {
    id: string;
    categoria: string;
    nivel: number;
}

export interface CategoriaConJerarquiaCompleta extends Categoria {
    jerarquia: CategoriaJerarquia[];
}

export type CategoriaDetailResponse = ApiResponse<Categoria>;
export type CategoriaJerarquiaResponse = ApiResponse<CategoriaConJerarquiaCompleta>;
export type CategoriasResponse = PaginatedResponse<Categoria>;
export type CategoriasDisponiblesResponse = ApiResponse<Categoria[]>;