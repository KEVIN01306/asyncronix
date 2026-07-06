import AppError from '@shared/errors/AppError.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import type { CajaCrear, CajaObtenidoDetalle } from '../domain/caja.entity.js';
import type { CajaRepository } from '../domain/caja.repository.js';

export class RegistrarCajaUseCase {
    constructor(private readonly cajaRepository: CajaRepository) {}

    async execute(data: CajaCrear, negocio_id: string, sucursal_id: string): Promise<CajaObtenidoDetalle> {
        try {
            return await this.cajaRepository.registrar(data, negocio_id, sucursal_id);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
