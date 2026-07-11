import type { Paginated } from '@shared/domain/paginated.js';
import type { CuentaBancariaActualizar, CuentaBancariaCrear, CuentaBancariaObtenidoDetalle, CuentaBancariaSimple } from './cuenta-bancaria.entity.js';
import type { Pagination } from '@shared/domain/pagination.js';

export interface CuentaBancariaRepository {
    registrar(data: CuentaBancariaCrear, negocio_id: string): Promise<CuentaBancariaObtenidoDetalle>;
    actualizar(id: string, negocio_id: string, data: CuentaBancariaActualizar): Promise<CuentaBancariaObtenidoDetalle>;
    actualizarSaldo(id: string, negocio_id: string, nuevoSaldo: number): Promise<CuentaBancariaObtenidoDetalle>;
    eliminar(id: string, negocio_id: string): Promise<void>;
    obtener(id: string, negocio_id: string): Promise<CuentaBancariaObtenidoDetalle | null>;
    listar(negocio_id: string, pagination: Pagination, q?: string): Promise<Paginated<CuentaBancariaSimple>>;
}
