import AppError from '@shared/errors/AppError.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import type { Paginated } from '@shared/domain/paginated.js';
import type { IngresoEgresoEntity } from '../domain/transaccion.entity.js';
import type { TransaccionRepository, ListarIngresosEgresosFilters } from '../domain/transaccion.repository.js';

export class ListarIngresosEgresosUseCase {
    constructor(private readonly transaccionRepository: TransaccionRepository) {}

    async execute(
        negocio_id: string,
        sucursal_id: string,
        page: number,
        limit: number,
        filters?: ListarIngresosEgresosFilters
    ): Promise<Paginated<IngresoEgresoEntity>> {
        try {
            return await this.transaccionRepository.listarIngresosEgresos(
                negocio_id,
                sucursal_id,
                { page, perPage: limit },
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
