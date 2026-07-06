import type { Paginated } from '@shared/domain/paginated.js';
import type { CajaActualizar, CajaCrear, CajaObtenidoDetalle, CajaSimple } from './caja.entity.js';
import type { Pagination } from '@shared/domain/pagination.js';

export interface CajaRepository {
    registrar(data: CajaCrear, negocio_id: string, sucursal_id: string): Promise<CajaObtenidoDetalle>;
    actualizar(id: string, negocio_id: string, sucursal_id: string, data: CajaActualizar): Promise<CajaObtenidoDetalle>;
    eliminar(id: string, negocio_id: string, sucursal_id: string): Promise<void>;
    obtener(id: string, negocio_id: string, sucursal_id: string): Promise<CajaObtenidoDetalle | null>;
    listar(negocio_id: string, sucursal_id: string, pagination: Pagination, q?: string): Promise<Paginated<CajaSimple>>;
}
