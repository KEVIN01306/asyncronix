import type { ApiResponse, PaginatedResponse } from "../../../../core/api/interfaces/api-response.interface";
import type { Sucursal } from "../../../sucursales/domain/interfaces/sucursal.interface";

export interface Rol {
    id: string;
    nombre: string;
}

export interface Usuario {
    id: string,
    nombre: string,
    apellido: string | null,
    avatar_url: string | null,
    email: string,
    telefono: string,
    roles: Rol[],
    verificado: boolean | null,
    sucursal?: Pick<Sucursal, 'id' | 'nombre'> | null;
}

export type UsuarioDetailResponse = ApiResponse<Usuario>

export type UsuariosResponse = PaginatedResponse<Usuario>