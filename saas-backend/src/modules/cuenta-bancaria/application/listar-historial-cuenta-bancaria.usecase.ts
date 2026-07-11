import type { Pagination } from '@shared/domain/pagination.js';
import type { Paginated } from '@shared/domain/paginated.js';
import type { TransaccionRepository } from '../../transaccion/domain/transaccion.repository.js';
import type { IngresoEgresoEntity, TipoOrigenTransaccion } from '../../transaccion/domain/transaccion.entity.js';

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
        origen_tipos?: TipoOrigenTransaccion[]
    ): Promise<Paginated<IngresoEgresoEntity>> {
        return await this.transaccionRepository.listarIngresosEgresos(
            negocio_id,
            sucursal_id,
            pagination,
            {
                q,
                entidad_tipo: 'CUENTA',
                entidad_id: cuenta_bancaria_id,
                fecha_inicio,
                fecha_fin,
                origen_tipos
            }
        );
    }
}
