import AppError from '@shared/errors/AppError.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import type { Paginated } from '@shared/domain/paginated.js';
import type { CategoriaTransaccionSimple } from '../domain/categoria-transaccion.entity.js';
import type { CategoriaTransaccionRepository } from '../domain/categoria-transaccion.repository.js';

export class ObtenerCategoriasTransaccionUseCase {
  constructor(private readonly repository: CategoriaTransaccionRepository) {}

  async execute(negocio_id: string, page: number, perPage: number, filters?: { q?: string; tipo?: string | null }): Promise<Paginated<CategoriaTransaccionSimple>> {
    try {
      return await this.repository.listar(negocio_id, page, perPage, filters);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new AppError('Error en la base de datos', 'DATABASE_ERROR', 500);
      }
      throw error;
    }
  }
}
