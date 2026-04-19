import type { CategoriaSimple } from "../domain/categoria.entity.js";
import type { CategoriaRepository } from "../domain/categoria.repository.js";
import type { Pagination } from "@shared/domain/pagination.js";
import type { Paginated } from "@shared/domain/paginated.js";

export class ObtenerCategoriasUseCase {
    constructor(private readonly repository: CategoriaRepository) { }

    async execute(negocio_id: string, pagination: Pagination): Promise<Paginated<CategoriaSimple>> {
        return await this.repository.listar(negocio_id, pagination);
    }
}
