import type { CategoriaRepository } from "../domain/categoria.repository.js";
import { NotFoundPersistenceError } from "@shared/database/errors/NotFoundPersistenceError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";

export class EliminarCategoriaUseCase {
    constructor(private readonly repository: CategoriaRepository) { }

    async execute(id: string, negocio_id: string): Promise<void> {
        try {
            await this.repository.eliminar(id, negocio_id);
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) {
                throw new AppError('Categoria no encontrada', 'CATEGORIA_NOT_FOUND', 404);
            }

            if (error instanceof DatabaseError) {
                throw new AppError('Error en la base de datos', 'DATABASE_ERROR', 500);
            }

            throw error;
        }
    }
}
