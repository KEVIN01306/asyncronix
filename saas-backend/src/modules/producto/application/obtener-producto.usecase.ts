import type { ProductoDetalle } from "../domain/producto.entity.js";
import type { ProductoRepository } from "../domain/producto.repository.js";
import AppError from "@shared/errors/AppError.js";

export class ObtenerProductoUseCase {
    constructor(private readonly repository: ProductoRepository) { }

    async execute(id: string, negocio_id: string): Promise<ProductoDetalle | null> {

        const producto = await this.repository.obtener(id, negocio_id);
        if (!producto) throw new AppError('Producto no encontrado', 'PRODUCTO_NOT_FOUND', 404);
        return producto;
    }
}
