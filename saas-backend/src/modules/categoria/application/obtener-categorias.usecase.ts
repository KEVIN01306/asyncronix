import type { CategoriaSimple } from "../domain/categoria.entity.js";
import type { CategoriaRepository } from "../domain/categoria.repository.js";
import type { Pagination } from "@shared/domain/pagination.js";
import type { Paginated } from "@shared/domain/paginated.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";

export class ObtenerCategoriasUseCase {
    constructor(private readonly repository: CategoriaRepository) { }

    async execute(negocio_id: string, pagination: Pagination, q?: string | null): Promise<Paginated<CategoriaSimple>> {
        try {
            return await this.repository.listar(negocio_id, pagination, q);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError('Error en la base de datos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
