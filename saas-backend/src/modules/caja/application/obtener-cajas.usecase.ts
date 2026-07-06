import AppError from '@shared/errors/AppError.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import type { Paginated } from '@shared/domain/paginated.js';
import type { CajaSimple } from '../domain/caja.entity.js';
import type { CajaRepository } from '../domain/caja.repository.js';

export class ObtenerCajasUseCase {
    constructor(private readonly cajaRepository: CajaRepository) {}

    async execute(negocio_id: string, sucursal_id: string, page: number, perPage: number, q?: string): Promise<Paginated<CajaSimple>> {
        try {
            return await this.cajaRepository.listar(negocio_id, sucursal_id, { page, perPage }, q);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
