import AppError from "../../../shared/errors/AppError.js";
import type { ProductoDetalle } from "../../producto/domain/producto.entity.js";
import type { ProductoRepository } from "../../producto/domain/producto.repository.js";

export class BuscarProductoPorSkuUseCase {
    constructor(private readonly productoRepository: ProductoRepository) {}

    async execute(sku: string, negocio_id: string): Promise<ProductoDetalle> {
        const producto = await this.productoRepository.obtenerPorSku(sku, negocio_id);
        if (!producto) {
            throw new AppError('Producto no encontrado', 'PRODUCTO_NO_ENCONTRADO', 404);
        }
        return producto;
    }
}
