import AppError from '@shared/errors/AppError.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import { UniqueConstraintError } from '@shared/database/errors/UniqueConstraintError.js';
import type { CategoriaTransaccionCrear, CategoriaTransaccionSimple } from '../domain/categoria-transaccion.entity.js';
import type { CategoriaTransaccionRepository } from '../domain/categoria-transaccion.repository.js';

export class RegistrarCategoriaTransaccionUseCase {
  constructor(private readonly repository: CategoriaTransaccionRepository) {}

  async execute(data: CategoriaTransaccionCrear, negocio_id: string): Promise<CategoriaTransaccionSimple> {
    try {
      if (!data.nombre?.trim()) {
        throw new AppError('El nombre es obligatorio', 'VALIDATION_ERROR', 400);
      }

      if (data.tipo !== 'INGRESO' && data.tipo !== 'EGRESO') {
        throw new AppError('Solo se permiten categorías de ingreso o egreso', 'VALIDATION_ERROR', 400);
      }

      return await this.repository.registrar({ ...data, nombre: data.nombre.trim() }, negocio_id);
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
