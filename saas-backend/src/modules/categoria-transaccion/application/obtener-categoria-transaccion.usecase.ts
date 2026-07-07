import AppError from '@shared/errors/AppError.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import type { CategoriaTransaccionSimple } from '../domain/categoria-transaccion.entity.js';
import type { CategoriaTransaccionRepository } from '../domain/categoria-transaccion.repository.js';

export class ObtenerCategoriaTransaccionUseCase {
  constructor(private readonly repository: CategoriaTransaccionRepository) {}

  async execute(id: string, negocio_id: string): Promise<CategoriaTransaccionSimple | null> {
    try {
      return await this.repository.obtener(id, negocio_id);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new AppError('Error en la base de datos', 'DATABASE_ERROR', 500);
      }
      throw error;
    }
  }
}
