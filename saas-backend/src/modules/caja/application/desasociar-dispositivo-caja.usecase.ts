import AppError from '@shared/errors/AppError.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import type { CajaRepository } from '../domain/caja.repository.js';

export class DesasociarDispositivoCajaUseCase {
    constructor(private readonly cajaRepository: CajaRepository) {}

    async execute(id: string, negocio_id: string, sucursal_id: string, token_autorizado?: string | null): Promise<void> {
        try {
            await this.cajaRepository.desasociarDispositivo(id, negocio_id, sucursal_id, token_autorizado);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
