import AppError from '@shared/errors/AppError.js';
import { PersistenceError } from '@shared/database/errors/PersistenceError.js';
import { NotFoundPersistenceError } from '@shared/database/errors/NotFoundPersistenceError.js';
import { InvalidTrasladoStatePersistenceError } from '@shared/database/errors/InvalidTrasladoStatePersistenceError.js';
import type { TrasladoRepository } from '../domain/traslado.repository.js';

export class CancelarTrasladoUseCase {
    constructor(private readonly repository: TrasladoRepository) { }

    async execute(id: string, negocio_id: string, origen_id: string, comentario: string): Promise<void> {
        try {
            await this.repository.cancelar(id, negocio_id, origen_id, comentario);
        } catch (error: any) {
            if (error instanceof PersistenceError) {
                if (error instanceof NotFoundPersistenceError) {
                    throw new AppError('Traslado no encontrado', 'NOT_FOUND', 404);
                }
                if (error instanceof InvalidTrasladoStatePersistenceError) {
                    throw new AppError('Solo se puede cancelar un traslado pendiente', 'INVALID_STATE', 400);
                }
                throw new AppError(error.message || 'Error de persistencia al cancelar traslado', 'PERSISTENCE_ERROR', 500);
            }
            throw error;
        }
    }
}
