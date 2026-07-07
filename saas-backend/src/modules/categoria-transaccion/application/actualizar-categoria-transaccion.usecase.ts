import AppError from '@shared/errors/AppError.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import { UniqueConstraintError } from '@shared/database/errors/UniqueConstraintError.js';
import type { CategoriaTransaccionActualizar, CategoriaTransaccionSimple } from '../domain/categoria-transaccion.entity.js';
import type { CategoriaTransaccionRepository } from '../domain/categoria-transaccion.repository.js';

export class ActualizarCategoriaTransaccionUseCase {
  constructor(private readonly repository: CategoriaTransaccionRepository) {}

  async execute(id: string, negocio_id: string, data: CategoriaTransaccionActualizar): Promise<CategoriaTransaccionSimple> {
    try {
      if (data.nombre !== undefined && !data.nombre?.trim()) {
        throw new AppError('El nombre es obligatorio', 'VALIDATION_ERROR', 400);
      }

      if (data.tipo !== undefined && data.tipo !== 'INGRESO' && data.tipo !== 'EGRESO') {
        throw new AppError('Solo se permiten categorías de ingreso o egreso', 'VALIDATION_ERROR', 400);
      }

      const payload = {
        ...data,
        ...(data.nombre !== undefined ? { nombre: data.nombre.trim() } : {}),
      };

      return await this.repository.actualizar(id, negocio_id, payload);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof UniqueConstraintError) {
        throw new AppError('Ya existe una categoría con ese nombre en este negocio', 'DATA_ALREADY_EXISTS', 409);
      }
      if (error instanceof DatabaseError) {
        throw new AppError('Error en la base de datos', 'DATABASE_ERROR', 500);
      }
      throw error;
    }
  }
}
