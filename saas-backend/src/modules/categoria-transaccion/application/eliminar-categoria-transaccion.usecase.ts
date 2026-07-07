import AppError from '@shared/errors/AppError.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import { NotFoundPersistenceError } from '@shared/database/errors/NotFoundPersistenceError.js';
import type { CategoriaTransaccionRepository } from '../domain/categoria-transaccion.repository.js';

export class EliminarCategoriaTransaccionUseCase {
  constructor(private readonly repository: CategoriaTransaccionRepository) {}

  async execute(id: string, negocio_id: string): Promise<void> {
    try {
      await this.repository.eliminar(id, negocio_id);
    } catch (error) {
      if (error instanceof NotFoundPersistenceError) {
        throw new AppError('Categoría no encontrada', 'NOT_FOUND', 404);
      }
      if (error instanceof DatabaseError) {
        throw new AppError('Error en la base de datos', 'DATABASE_ERROR', 500);
      }
      throw error;
    }
  }
}
