import type { Paginated } from '@shared/domain/paginated.js';
import type { Pagination } from '@shared/domain/pagination.js';
import type { Transaccion, TransaccionCrear, TransaccionDetalle, TransaccionSimple } from './transaccion.entity.js';

export interface ListarTransaccionesMovimientosFilters {
    q?: string;
    tipo_movimiento?: 'INGRESO' | 'EGRESO';
    categoria_id?: string;
    entidad_tipo?: 'CAJA' | 'CUENTA';
    entidad_id?: string;
    fecha_inicio?: Date;
    fecha_fin?: Date;
}

export interface TransaccionRepository {
    crearMovimiento(
        data: TransaccionCrear,
        negocio_id: string,
        sucursal_id: string,
        usuario_id: string
    ): Promise<TransaccionDetalle>;

    obtenerDetalle(
        id: string,
        negocio_id: string,
        sucursal_id: string
    ): Promise<TransaccionDetalle | null>;

    listarMovimientos(
        negocio_id: string,
        sucursal_id: string,
        pagination: Pagination,
        filters?: ListarTransaccionesMovimientosFilters
    ): Promise<Paginated<TransaccionSimple>>;
}
