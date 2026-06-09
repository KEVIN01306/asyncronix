import type { VarianteDetalle } from "../domain/variante.entity.js";
import type { VarianteRepository } from "../domain/variante.repository.js";

export class ListarVariantesProductoUseCase {
    constructor(private readonly repository: VarianteRepository) { }

    async execute(producto_id: string, negocio_id: string): Promise<VarianteDetalle[]> {
        return await this.repository.listarPorProducto(producto_id, negocio_id);
    }
}
