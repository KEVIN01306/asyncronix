import type { Paginated } from "@shared/domain/paginated.js";
import type { SucursalActualizar, SucursalCrear, SucursalCrearPersistencia, SucursalMiDetalle, SucursalObtenidoDetalle, SucursalSimple } from "./sucursal.entity.js";
import type { Pagination } from "@shared/domain/pagination.js";

export interface SucursalRepository {
    registrar(data: SucursalCrearPersistencia, negocio_id: string): Promise<SucursalObtenidoDetalle>;
    actualizar(id: string, negocio_id: string, data: SucursalActualizar): Promise<SucursalObtenidoDetalle>;
    eliminar(id: string, negocio_id: string): Promise<void>;
    obtener(id: string, negocio_id: string): Promise<SucursalObtenidoDetalle | null>;
    obtenerMiSucursal(negocio_id: string, sucursal_id: string): Promise<SucursalMiDetalle | null>;
    asignarCuentaBancaria(negocio_id: string, sucursal_id: string, cuenta_bancaria_id: string, metodo_pago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO'): Promise<SucursalMiDetalle | null>;
    listar(negocio_id: string, pagination: Pagination, q?: string): Promise<Paginated<SucursalSimple>>;
    contar(negocio_id: string): Promise<number>;
}
