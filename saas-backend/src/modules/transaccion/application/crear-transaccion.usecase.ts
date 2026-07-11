import AppError from '@shared/errors/AppError.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import type { Transaccion, TransaccionCrearDirecta } from '../domain/transaccion.entity.js';
import type { TransaccionRepository } from '../domain/transaccion.repository.js';

/**
 * Generic use case for creating any type of transaction.
 *
 * This use case is exclusively for persistence. It does NOT apply any
 * business logic — the caller is responsible for providing all fields
 * correctly (origin/destination entities, amounts, exchange rates, etc.).
 *
 * Intended for internal use by other modules (e.g., sales, services)
 * that need to record transactions as part of their own workflows.
 */
export class CrearTransaccionUseCase {
    constructor(private readonly transaccionRepository: TransaccionRepository) {}

    async execute(data: TransaccionCrearDirecta): Promise<Transaccion> {
        try {
            return await this.transaccionRepository.crearTransaccion(data);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            if (error instanceof DatabaseError) {
                throw new AppError('Error al registrar la transacción', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
