import { UniqueConstraintError } from "@shared/database/errors/UniqueConstraintError.js";
import type { CategoriaSimple, CategoriaActualizar } from "../domain/categoria.entity.js";
import type { CategoriaRepository } from "../domain/categoria.repository.js";
import AppError from "@shared/errors/AppError.js";
import { NotFoundPersistenceError } from "@shared/database/errors/NotFoundPersistenceError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";

export class ActualizarCategoriaUseCase {
    constructor(private readonly repository: CategoriaRepository) { }

    async execute(id: string, negocio_id: string, data: CategoriaActualizar): Promise<CategoriaSimple> {
        try {

            const categoriaExiste = await this.repository.obtenerDefaultPorCategoria(data.categoria as string)

            if (categoriaExiste) throw new AppError('Esta categoria tiene un nombre de una categoria por defult', 'DATA_ALREADY_EXISTS', 409)

            return await this.repository.actualizar(id, data, negocio_id);
        } catch (error) {

            if (error instanceof UniqueConstraintError ) {
                throw new AppError('Este nombre de categoria ya existe en el negocio', 'DATA_ALREADY_EXISTS', 409);
            }

            if (error instanceof NotFoundPersistenceError ) {
                throw new AppError('Esta categoria no existe', 'DATA_NOT_FOUND', 404);
            }

            if (error instanceof DatabaseError ) {
                throw new AppError('Error en la base de datos', 'DATABASE_ERROR', 500);
            }

            throw error
        }
    }
}
