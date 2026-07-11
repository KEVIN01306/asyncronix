import AppError from '@shared/errors/AppError.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import type { Paginated } from '@shared/domain/paginated.js';
import type { TransaccionRepository } from '../domain/transaccion.repository.js';
import type { Transaccion } from '../domain/transaccion.entity.js';

export class ListarHistorialEntidadUseCase {
    constructor(private readonly transaccionRepository: TransaccionRepository) {}

    async execute(
        negocio_id: string,
        sucursal_id: string,
        entidad_tipo: 'CAJA' | 'CUENTA',
        entidad_id: string,
        page: number,
        limit: number
    ): Promise<Paginated<Transaccion>> {
        try {
            return await this.transaccionRepository.listarHistorialEntidad(
                negocio_id,
                sucursal_id,
                entidad_tipo,
                entidad_id,
                { page, perPage: limit }
            );
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            if (error instanceof DatabaseError) {
                throw new AppError('Error al obtener el historial', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
