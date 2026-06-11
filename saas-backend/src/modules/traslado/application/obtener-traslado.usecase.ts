import AppError from '@shared/errors/AppError.js';
import { NotFoundPersistenceError } from '@shared/database/errors/NotFoundPersistenceError.js';
import type { TrasladoDetalle } from '../domain/traslado.entity.js';
import type { TrasladoRepository } from '../domain/traslado.repository.js';

export class ObtenerTrasladoUseCase {
    constructor(private readonly repository: TrasladoRepository) { }

    async execute(id: string, negocio_id: string): Promise<TrasladoDetalle> {
        try {
            const traslado = await this.repository.obtener(id, negocio_id);
            if (!traslado) {
                throw new AppError('Traslado no encontrado', 'NOT_FOUND', 404);
            }
            return traslado;
        } catch (error: any) {
            if (error instanceof NotFoundPersistenceError) {
                throw new AppError('Traslado no encontrado', 'NOT_FOUND', 404);
            }
            throw error;
        }
    }
}
