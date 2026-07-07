import AppError from '@shared/errors/AppError.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import type { Paginated } from '@shared/domain/paginated.js';
import type { Pagination } from '@shared/domain/pagination.js';
import type { TransaccionSimple } from '../domain/transaccion.entity.js';
import type { TransaccionRepository, ListarTransaccionesMovimientosFilters } from '../domain/transaccion.repository.js';

export class ListarMovimientosUseCase {
    constructor(private readonly transaccionRepository: TransaccionRepository) {}

    async execute(
        negocio_id: string,
        sucursal_id: string,
        page: number,
        limit: number,
        filters?: ListarTransaccionesMovimientosFilters
    ): Promise<Paginated<TransaccionSimple>> {
        try {
            const offset = (page - 1) * limit;
            const pagination: Pagination = { limit, offset };
            
            return await this.transaccionRepository.listarMovimientos(
                negocio_id,
                sucursal_id,
                pagination,
                filters
            );
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
