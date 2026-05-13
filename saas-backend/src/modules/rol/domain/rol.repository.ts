import type { Paginated } from "@shared/domain/paginated.js";
import type { Pagination } from "@shared/domain/pagination.js";
import type { Rol, RolActualizar, RolCrear, RolObtenidoDetalle, RolSimple } from "./rol.entity.js";

export interface RolRepository {
    obtener(id: Rol["id"], negocio_id: Rol["negocio_id"]): Promise<RolObtenidoDetalle | null>
    listar(negocio_id: Rol["negocio_id"], pagination: Pagination): Promise<Paginated<RolSimple>>
    validarPermisos(negocio_id: Rol["negocio_id"], permisoIds: string[]): Promise<void>
    registrar(data: RolCrear, negocio_id: Rol["negocio_id"]): Promise<RolSimple>
    actualizar(id: Rol["id"], negocio_id: Rol["negocio_id"], data: RolActualizar): Promise<RolSimple>
    eliminar(id: Rol["id"], negocio_id: Rol["negocio_id"]): Promise<void>
}
