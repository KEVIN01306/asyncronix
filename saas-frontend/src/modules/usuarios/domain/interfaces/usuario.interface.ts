import type { ApiResponse, PaginatedResponse } from "../../../../core/api/interfaces/api-response.interface";
import type { Sucursal } from "../../../sucursales/domain/interfaces/sucursal.interface";



export interface Usuario {
    id: string,
    nombre: string,
    apellido: string,
    email: string,
    telefono: string,
    roles: string[],
    verificado: boolean | null,
    sucursal?: Pick<Sucursal, 'id' | 'nombre'> | null;
}

export type UsuarioDetailResponse = ApiResponse<Usuario>

export type UsuariosResponse = PaginatedResponse<Usuario>