import AppError from '@shared/errors/AppError.js';
import { PersistenceError } from '@shared/database/errors/PersistenceError.js';
import { NotFoundPersistenceError } from '@shared/database/errors/NotFoundPersistenceError.js';
import { InvalidTrasladoStatePersistenceError } from '@shared/database/errors/InvalidTrasladoStatePersistenceError.js';
import type { TrasladoRepository } from '../domain/traslado.repository.js';

export class RecibirTrasladoUseCase {
    constructor(private readonly repository: TrasladoRepository) { }

    async execute(id: string, negocio_id: string, destino_id: string): Promise<void> {
        try {
            await this.repository.recibir(id, negocio_id, destino_id);
        } catch (error: any) {
            if (error instanceof PersistenceError) {
                if (error instanceof NotFoundPersistenceError) {
                    throw new AppError('Traslado no encontrado', 'NOT_FOUND', 404);
                }
                if (error instanceof InvalidTrasladoStatePersistenceError) {
                    throw new AppError('Solo se puede recibir un traslado pendiente', 'INVALID_STATE', 400);
                }
                throw new AppError(error.message || 'Error de persistencia al recibir traslado', 'PERSISTENCE_ERROR', 500);
            }
            throw error;
        }
    }
}
