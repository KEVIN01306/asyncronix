import type { ApiResponse, PaginatedResponse } from "../../../../core/api/interfaces/api-response.interface";

export interface Permiso {
    id: string;
    codigo: string;
    descripcion: string | null;
    modulo_id: string;
}

export interface Modulo {
    id: string;
    nombre: string;
    descripcion: string | null;
}

export interface Rol {
    id: string;
    nombre: string;
    descripcion: string | null;
    permisos?: Permiso[];
}

export type RolDetailResponse = ApiResponse<Rol>;
export type RolesResponse = PaginatedResponse<Rol>;
