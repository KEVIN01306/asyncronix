import AppError from '@shared/errors/AppError.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import type { CajaActualizar, CajaObtenidoDetalle } from '../domain/caja.entity.js';
import type { CajaRepository } from '../domain/caja.repository.js';

export class ActualizarCajaUseCase {
    constructor(private readonly cajaRepository: CajaRepository) {}

    async execute(id: string, negocio_id: string, sucursal_id: string, data: CajaActualizar): Promise<CajaObtenidoDetalle> {
        try {
            return await this.cajaRepository.actualizar(id, negocio_id, sucursal_id, data);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
