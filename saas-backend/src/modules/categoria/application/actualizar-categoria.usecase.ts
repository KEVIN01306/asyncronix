import { UniqueConstraintError } from "@shared/database/errors/UniqueConstraintError.js";
import type { CategoriaSimple, CategoriaActualizar } from "../domain/categoria.entity.js";
import type { CategoriaRepository } from "../domain/categoria.repository.js";
import AppError from "@shared/errors/AppError.js";
import { NotFoundPersistenceError } from "@shared/database/errors/NotFoundPersistenceError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { CategoriaJerarquiaService } from "./services/categoria-jerarquia.service.js";

export class ActualizarCategoriaUseCase {
    constructor(
        private readonly repository: CategoriaRepository,
        private readonly jerarquiaService: CategoriaJerarquiaService
    ) { }

    async execute(id: string, negocio_id: string, data: CategoriaActualizar): Promise<CategoriaSimple> {
        try {
            if (!data.categoria_padre_id) {
                throw new AppError('La categoria padre es obligatoria', 'INVALID_DATA', 400);
            }

            // Validar que no intente cambiar a un nombre de categoría default
            if (data.categoria) {
                const categoriaExiste = await this.repository.obtenerDefaultPorCategoria(data.categoria)
                if (categoriaExiste) throw new AppError('Esta categoria tiene un nombre de una categoria por defult', 'DATA_ALREADY_EXISTS', 409)
            }

            const categoriaPadre = await this.repository.obtener(data.categoria_padre_id, negocio_id);
            if (!categoriaPadre) {
                throw new AppError('La categoria padre no existe', 'DATA_NOT_FOUND', 404);
            }

            // Validar que no sea descendiente de sí mismo
            if (await this.jerarquiaService.esDescendienteOIgual(id, data.categoria_padre_id, negocio_id)) {
                throw new AppError('No puede establecer un descendiente como padre', 'INVALID_DATA', 400);
            }

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
