import type { ProductoRepository } from "../domain/producto.repository.js";
import AppError from "@shared/errors/AppError.js";

export class ListarAtributosProductoUseCase {
    constructor(private readonly repository: ProductoRepository) { }

    async execute(producto_id: string, negocio_id: string) {
        const atributos = await this.repository.listarAtributosProducto(producto_id, negocio_id);
        if (!atributos) throw new AppError('Producto no encontrado', 'PRODUCTO_NOT_FOUND', 404);
        return atributos;
    }
}
