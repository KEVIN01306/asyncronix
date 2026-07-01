import type { ImagenProducto } from "../domain/producto.entity.js";
import type { ProductoRepository } from "../domain/producto.repository.js";

export class ListarImagenesProductoUseCase {
    constructor(private readonly repository: ProductoRepository) { }

    async execute(producto_id: string, negocio_id: string): Promise<ImagenProducto[]> {
        return this.repository.listarImagenes(producto_id, negocio_id);
    }
}
