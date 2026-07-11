import type { Paginated } from '@shared/domain/paginated.js';
import type { Pagination } from '@shared/domain/pagination.js';
import type {
    Transaccion,
    TransaccionCrear,
    TransaccionCrearDirecta,
    IngresoEgresoEntity,
    TipoOrigenTransaccion
} from './transaccion.entity.js';

export interface ListarIngresosEgresosFilters {
    q?: string | undefined;
    tipo_movimiento?: 'INGRESO' | 'EGRESO' | undefined;
    categoria_id?: string | undefined;
    entidad_tipo?: 'CAJA' | 'CUENTA' | undefined;
    entidad_id?: string | undefined;
    fecha_inicio?: Date | undefined;
    fecha_fin?: Date | undefined;
    origen_tipos?: TipoOrigenTransaccion[] | undefined;
}

export interface TransaccionRepository {
    /**
     * Generic low-level method: persists any transaction as-is.
     * The caller is responsible for providing all required fields.
     * Used internally by other modules (sales, services, etc.).
     */
    crearTransaccion(data: TransaccionCrearDirecta, options?: { tx?: any }): Promise<Transaccion>;

    /**
     * Creates an Ingreso or Egreso (applies origin/destination logic).
     * Used by CrearIngresoEgresoUseCase.
     */
    crearIngresoEgreso(
        data: TransaccionCrear,
        negocio_id: string,
        sucursal_id: string,
        usuario_id: string
    ): Promise<IngresoEgresoEntity>;

    /**
     * Returns detailed information of a single Ingreso/Egreso as a
     * semantic entity ready for the frontend.
     */
    obtenerDetalle(
        id: string,
        negocio_id: string,
        sucursal_id: string
    ): Promise<IngresoEgresoEntity | null>;

    /**
     * Returns a paginated list of Ingresos/Egresos as semantic entities
     * ready for the frontend.
     */
    listarIngresosEgresos(
        negocio_id: string,
        sucursal_id: string,
        pagination: Pagination,
        filters?: ListarIngresosEgresosFilters
    ): Promise<Paginated<IngresoEgresoEntity>>;

    /**
     * Returns a paginated list of all transactions associated with a Caja or Cuenta.
     * Includes Ingresos, Egresos, Ventas, Servicios, Movimientos Internos, etc.
     */
    listarHistorialEntidad(
        negocio_id: string,
        sucursal_id: string,
        entidad_tipo: 'CAJA' | 'CUENTA',
        entidad_id: string,
        pagination: Pagination
    ): Promise<Paginated<Transaccion>>;
}
