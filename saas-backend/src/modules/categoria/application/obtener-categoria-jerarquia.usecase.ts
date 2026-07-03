import type { CategoriaRepository } from "../domain/categoria.repository.js";
import type { CategoriaJerarquiaCompleta } from "../domain/categoria.entity.js";
import AppError from "@shared/errors/AppError.js";
import type { CategoriaJerarquiaService } from "./services/categoria-jerarquia.service.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";

export class ObtenerCategoriaJerarquiaUseCase {
    constructor(
        private readonly repository: CategoriaRepository,
        private readonly jerarquiaService: CategoriaJerarquiaService
    ) { }

    async execute(id: string, negocio_id: string): Promise<CategoriaJerarquiaCompleta> {
        try {
            const categoria = await this.repository.obtener(id, negocio_id);

            if (!categoria) {
                throw new AppError('Categoria no encontrada', 'NOT_FOUND', 404);
            }

            const jerarquia = await this.jerarquiaService.construirJerarquiaAscendente(id, negocio_id);

            return {
                ...categoria,
                jerarquia
            };
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError('Error en la base de datos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
