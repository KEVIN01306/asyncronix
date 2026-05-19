import type { ProductoDetalle } from "../domain/producto.entity.js";
import type { ProductoRepository } from "../domain/producto.repository.js";
import AppError from "@shared/errors/AppError.js";

interface Params {
    producto_id: string;
    url_imagen: string;
    negocio_id: string;
}

export class SubirImagenProductoUseCase {
    constructor(private readonly repository: ProductoRepository) { }

    async execute({ producto_id, url_imagen, negocio_id }: Params): Promise<ProductoDetalle> {
        const producto = await this.repository.obtener(producto_id, negocio_id);
        if (!producto) throw new AppError('Producto no encontrado', 'PRODUCTO_NOT_FOUND', 404);

        return await this.repository.registrarImagen(producto_id, url_imagen, negocio_id);
    }
}
