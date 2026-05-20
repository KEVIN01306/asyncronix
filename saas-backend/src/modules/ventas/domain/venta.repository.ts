import type { Pagination } from "../../../shared/domain/pagination.js";
import type { Paginated } from "../../../shared/domain/paginated.js";
import type { VentaSimple, VentaCrear, VentaActualizar } from "./venta.entity.js";

export interface VentaRepository {
    registrar(data: VentaCrear, negocio_id: string, sucursal_id: string, usuario_id: string): Promise<VentaSimple>;
    actualizar(id: string, data: VentaActualizar, negocio_id: string, sucursal_id: string): Promise<VentaSimple>;
    anular(id: string, negocio_id: string): Promise<VentaSimple>;
    obtener(id: string, negocio_id: string): Promise<VentaSimple | null>;
    listar(negocio_id: string, sucursal_id: string, pagination: Pagination): Promise<Paginated<VentaSimple>>;
}
