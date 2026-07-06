import AppError from '@shared/errors/AppError.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import type { CajaRepository } from '../domain/caja.repository.js';

export class EliminarCajaUseCase {
    constructor(private readonly cajaRepository: CajaRepository) {}

    async execute(id: string, negocio_id: string, sucursal_id: string): Promise<void> {
        try {
            await this.cajaRepository.eliminar(id, negocio_id, sucursal_id);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
