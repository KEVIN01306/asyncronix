import AppError from '@shared/errors/AppError.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import type { CajaObtenidoDetalle } from '../domain/caja.entity.js';
import type { CajaRepository } from '../domain/caja.repository.js';

export class ObtenerCajaUseCase {
    constructor(private readonly cajaRepository: CajaRepository) {}

    async execute(id: string, negocio_id: string, sucursal_id: string): Promise<CajaObtenidoDetalle> {
        try {
            const caja = await this.cajaRepository.obtener(id, negocio_id, sucursal_id);
            if (!caja) {
                throw new AppError('No se encontró la caja', 'DATA_NOT_FOUND', 404);
            }
            return caja;
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
