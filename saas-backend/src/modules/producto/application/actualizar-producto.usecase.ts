import type { ProductoDetalle, ProductoActualizar } from "../domain/producto.entity.js";
import type { ProductoRepository } from "../domain/producto.repository.js";
import AppError from "@shared/errors/AppError.js";

export class ActualizarProductoUseCase {
    constructor(private readonly repository: ProductoRepository) { }

    async execute(id: string, negocio_id: string, data: ProductoActualizar): Promise<ProductoDetalle> {
        const existing = await this.repository.obtener(id, negocio_id);
        if (!existing) throw new AppError('Producto no encontrado', 'PRODUCTO_NOT_FOUND', 404);

        return await this.repository.actualizar(id, data, negocio_id);
    }
}
