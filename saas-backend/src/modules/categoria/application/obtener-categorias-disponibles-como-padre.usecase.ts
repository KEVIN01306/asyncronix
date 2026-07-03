import type { CategoriaRepository } from "../domain/categoria.repository.js";
import type { CategoriaSimple } from "../domain/categoria.entity.js";
import type { CategoriaJerarquiaService } from "./services/categoria-jerarquia.service.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";

export class ObtenerCategoriasDisponiblesComoPadreUseCase {
    constructor(
        private readonly repository: CategoriaRepository,
        private readonly jerarquiaService: CategoriaJerarquiaService
    ) { }

    async execute(negocio_id: string, categoriaIdExcluir?: string): Promise<CategoriaSimple[]> {
        try {
            // Obtener todas las categorías activas (default del sistema + del negocio)
            const categoriasDisponibles = await this.repository.obtenerTodas(negocio_id);

            // Filtrar: excluir la categoría actual y sus descendientes
            if (categoriaIdExcluir) {
                const descendientes = await this.jerarquiaService.obtenerDescendientes(categoriaIdExcluir, negocio_id);
                const idsExcluir = new Set([categoriaIdExcluir, ...descendientes.map(d => d.id)]);
                return categoriasDisponibles.filter(cat => !idsExcluir.has(cat.id));
            }

            return categoriasDisponibles;
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError('Error en la base de datos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
