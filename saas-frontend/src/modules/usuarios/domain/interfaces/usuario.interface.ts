import type { ApiResponse, PaginatedResponse } from "../../../../core/api/interfaces/api-response.interface";
import type { Sucursal } from "../../../sucursales/domain/interfaces/sucursal.interface";
import type { RolUsuario } from "../enums/rol.enum";



export interface Usuario {
    id: string,
    nombre: string,
    telefono: string,
    rol: RolUsuario,
    verificado: boolean | null,
    sucursal?: Pick<Sucursal, 'id' | 'nombre'> | null;
}

export type UsuarioDetailResponse = ApiResponse<Usuario>

export type UsuariosResponse = PaginatedResponse<Usuario>