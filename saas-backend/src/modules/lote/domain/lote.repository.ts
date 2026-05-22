import type { LoteCrear, LoteDetalle } from "./lote.entity.js";
import type { Pagination } from "@shared/domain/pagination.js";
import type { Paginated } from "@shared/domain/paginated.js";

export interface LoteRepository {
    registrar(lote: LoteCrear, negocio_id: string): Promise<LoteDetalle>;
    obtener(id: string, negocio_id: string): Promise<LoteDetalle | null>;
    listar(negocio_id: string, pagination: Pagination): Promise<Paginated<LoteDetalle>>;
    listarPorProducto(producto_id: string, negocio_id: string, pagination: Pagination, sucursal_id?: string): Promise<Paginated<LoteDetalle>>;
    disminuirCantidad(id: string, negocio_id: string, cantidad: number): Promise<void>;
}
