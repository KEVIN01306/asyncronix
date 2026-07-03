import { UniqueConstraintError } from "@shared/database/errors/UniqueConstraintError.js";
import type { CategoriaSimple, CategoriaCrear } from "../domain/categoria.entity.js";
import type { CategoriaRepository } from "../domain/categoria.repository.js";
import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";

export class RegistrarCategoriaUseCase {
    constructor(private readonly repository: CategoriaRepository) { }

    async execute(data: CategoriaCrear, negocio_id: string): Promise<CategoriaSimple> {
        try {
            if (!data.categoria_padre_id) {
                throw new AppError('La categoria padre es obligatoria', 'INVALID_DATA', 400);
            }
            
            const categoriaExiste = await this.repository.obtenerDefaultPorCategoria(data.categoria)

            if (categoriaExiste) throw new AppError('La Categoria ya existe por default', 'DATA_ALREADY_EXISTS', 409)

            const categoriaPadre = await this.repository.obtener(data.categoria_padre_id, negocio_id);
            if (!categoriaPadre) {
                throw new AppError('La categoria padre no existe', 'DATA_NOT_FOUND', 404);
            }

            return await this.repository.registrar(data, negocio_id);

        }catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new AppError('La Categoria ya existe', 'DATA_ALREADY_EXISTS', 409)
            }

            if (error instanceof DatabaseError) {
                throw new AppError('Error en la base de datos', 'DATABASE_ERROR', 500)
            }

            throw error
        }
    }
}
