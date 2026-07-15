import AppError from '@shared/errors/AppError.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import type { Paginated } from '@shared/domain/paginated.js';
import type { Pagination } from '@shared/domain/pagination.js';
import type { MovimientoInternoEntity } from '../domain/transaccion.entity.js';
import type { TransaccionRepository, ListarIngresosEgresosFilters } from '../domain/transaccion.repository.js';

export class ListarMovimientosInternosUseCase {
    constructor(private readonly transaccionRepository: TransaccionRepository) {}

    async execute(
        negocio_id: string,
        sucursal_id: string,
        pagination: Pagination,
        filters?: ListarIngresosEgresosFilters
    ): Promise<Paginated<MovimientoInternoEntity>> {
        try {
            return await this.transaccionRepository.listarMovimientosInternos(
                negocio_id,
                sucursal_id,
                pagination,
                filters
            );
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos al listar movimientos internos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
