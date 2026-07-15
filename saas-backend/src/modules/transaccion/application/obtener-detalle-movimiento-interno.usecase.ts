import AppError from '@shared/errors/AppError.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import type { MovimientoInternoEntity } from '../domain/transaccion.entity.js';
import type { TransaccionRepository } from '../domain/transaccion.repository.js';

export class ObtenerDetalleMovimientoInternoUseCase {
    constructor(private readonly transaccionRepository: TransaccionRepository) {}

    async execute(
        id: string,
        negocio_id: string,
        sucursal_id: string
    ): Promise<MovimientoInternoEntity> {
        try {
            const movimiento = await this.transaccionRepository.obtenerDetalleMovimientoInterno(
                id,
                negocio_id,
                sucursal_id
            );

            if (!movimiento) {
                throw new AppError('Movimiento interno no encontrado', 'NOT_FOUND', 404);
            }

            return movimiento;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos al obtener el detalle del movimiento', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
