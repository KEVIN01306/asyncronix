import type { Paginated } from "@shared/domain/paginated.js";
import type { SucursalActualizar, SucursalCrear, SucursalCrearPersistencia, SucursalObtenidoDetalle, SucursalSimple } from "./sucursal.entity.js";
import type { Pagination } from "@shared/domain/pagination.js";

export interface SucursalRepository {
    registrar(data: SucursalCrearPersistencia, negocio_id: string): Promise<SucursalObtenidoDetalle>;
    actualizar(id: string, negocio_id: string, data: SucursalActualizar): Promise<SucursalObtenidoDetalle>;
    eliminar(id: string, negocio_id: string): Promise<void>;
    obtener(id: string, negocio_id: string): Promise<SucursalObtenidoDetalle | null>;
    listar(negocio_id: string, pagination: Pagination): Promise<Paginated<SucursalSimple>>;
    contar(negocio_id: string): Promise<number>;
}
