import type { Pagination } from '@shared/domain/pagination.js';
import type { Paginated } from '@shared/domain/paginated.js';
import type { TransaccionRepository } from '../../transaccion/domain/transaccion.repository.js';
import type { Transaccion, TipoOrigenTransaccion } from '../../transaccion/domain/transaccion.entity.js';

export class ListarHistorialCuentaBancariaUseCase {
    constructor(private readonly transaccionRepository: TransaccionRepository) { }

    async execute(
        cuenta_bancaria_id: string,
        negocio_id: string,
        sucursal_id: string,
        pagination: Pagination,
        q?: string,
        fecha_inicio?: Date,
        fecha_fin?: Date,
        origen_tipos?: TipoOrigenTransaccion[],
        tipo_movimiento?: 'INGRESO' | 'EGRESO'
    ): Promise<Paginated<Transaccion>> {
        return await this.transaccionRepository.listarHistorialEntidad(
            negocio_id,
            sucursal_id,
            'CUENTA',
            cuenta_bancaria_id,
            pagination,
            {
                q,
                fecha_inicio,
                fecha_fin,
                origen_tipos,
                tipo_movimiento
            }
        );
    }
}
