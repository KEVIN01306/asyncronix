import type { ProductoRepository } from "../domain/producto.repository.js";
import AppError from "@shared/errors/AppError.js";

export class ActualizarAtributosProductoUseCase {
    constructor(private readonly repository: ProductoRepository) { }

    async execute(producto_id: string, negocio_id: string, atributo_ids: string[]) {
        const atributos = await this.repository.actualizarAtributosProducto(producto_id, negocio_id, atributo_ids);
        if (!atributos) throw new AppError('Producto no encontrado', 'PRODUCTO_NOT_FOUND', 404);
        return atributos;
    }
}
