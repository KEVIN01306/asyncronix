import type { Paginated } from "@shared/domain/paginated.js";
import type { Pagination } from "@shared/domain/pagination.js";
import type { Modulo, Permiso } from "./permiso.entity.js";

export interface PermisosRepository {
    listarModulos(negocio_id: string, pagination?: Pagination): Promise<Paginated<Modulo>>
    listarPermisos(negocio_id: string, modulo_id?: string, pagination?: Pagination): Promise<Paginated<Permiso>>
    obtenerPermisosRol(rol_id: string, negocio_id: string): Promise<Permiso[]>
    asignarPermisosRol(rol_id: string, negocio_id: string, permisoIds: string[]): Promise<Permiso[]>
}
