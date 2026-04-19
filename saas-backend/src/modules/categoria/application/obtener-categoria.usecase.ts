import type { CategoriaSimple } from "../domain/categoria.entity.js";
import type { CategoriaRepository } from "../domain/categoria.repository.js";
import AppError from "@shared/errors/AppError.js";

export class ObtenerCategoriaUseCase {
    constructor(private readonly repository: CategoriaRepository) { }

    async execute(id: string, negocio_id: string): Promise<CategoriaSimple | null> {
        const categoria = await this.repository.obtener(id, negocio_id);
        if (!categoria) throw new AppError('Categoria no encontrada', 'CATEGORIA_NOT_FOUND', 404);
        return categoria;
    }
}
