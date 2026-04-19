import type { Pagination } from "@shared/domain/pagination.js";
import type { Gasto, GastoActualizar, GastoCrear, GastoDetalle, GastoSimple } from "./gasto.entity.js";
import type { Paginated } from "@shared/domain/paginated.js";




export interface GastoRepository {
    registrar(gasto: GastoCrear, negocio_id: Gasto['negocio_id']): Promise<GastoSimple>;
    actualizar(id: string, gasto: GastoActualizar, negocio_id: string): Promise<GastoSimple>;
    eliminar(id: string, negocio_id: string): Promise<void>;
    obtener(id: string, negocio_id: string): Promise<GastoDetalle | null>;
    listar(negocio_id: string, pagination: Pagination, sucursal_ids?: string[] | undefined): Promise<Paginated<GastoSimple>>;
}
