import AppError from '@shared/errors/AppError.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import type { IngresoEgresoEntity } from '../domain/transaccion.entity.js';
import type { TransaccionRepository } from '../domain/transaccion.repository.js';

export class ObtenerDetalleIngresoEgresoUseCase {
    constructor(private readonly transaccionRepository: TransaccionRepository) { }

    async execute(id: string, negocio_id: string, sucursal_id: string): Promise<IngresoEgresoEntity> {
        try {
            const transaccion = await this.transaccionRepository.obtenerDetalle(id, negocio_id, sucursal_id);
            if (!transaccion) {
                throw new AppError('Ingreso/Egreso no encontrado', 'INGRESO_EGRESO_NOT_FOUND', 404);
            }
            return transaccion;
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
