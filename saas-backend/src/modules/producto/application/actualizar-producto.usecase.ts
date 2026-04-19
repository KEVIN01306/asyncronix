import type { ProductoDetalle, ProductoActualizar } from "../domain/producto.entity.js";
import type { ProductoRepository } from "../domain/producto.repository.js";

export class ActualizarProductoUseCase {
    constructor(private readonly repository: ProductoRepository) { }

    async execute(id: string, negocio_id: string, data: ProductoActualizar): Promise<ProductoDetalle> {

        return await this.repository.actualizar(id, data, negocio_id);
    }
}
