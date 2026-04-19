import type { ProductoSimple } from "../domain/producto.entity.js";
import type { ProductoRepository } from "../domain/producto.repository.js";
import type { Pagination } from "@shared/domain/pagination.js";
import type { Paginated } from "@shared/domain/paginated.js";

interface Params {
    negocio_id: string;
    pagination: Pagination;
    categoria_id?: string;
}

export class ObtenerProductosUseCase {
    constructor(private readonly repository: ProductoRepository) { }

    async execute({ negocio_id, pagination, categoria_id }: Params): Promise<Paginated<ProductoSimple>> {
        return await this.repository.listar(negocio_id, pagination, categoria_id);
    }
}
