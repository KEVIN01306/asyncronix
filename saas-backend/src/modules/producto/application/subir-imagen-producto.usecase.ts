import type { ProductoImagen, ProductoImagenCrear } from "../domain/producto.entity.js";
import type { ProductoRepository } from "../domain/producto.repository.js";
import AppError from "@shared/errors/AppError.js";

interface Params {
    producto_id: string;
    url_imagen: string;
    es_principal?: boolean;
    negocio_id: string;
}

export class SubirImagenProductoUseCase {
    constructor(private readonly repository: ProductoRepository) { }

    async execute({ producto_id, url_imagen, es_principal = false, negocio_id }: Params): Promise<ProductoImagen> {
        // Verificar que el producto exista y pertenezca al negocio
        const producto = await this.repository.obtener(producto_id, negocio_id);
        if (!producto) throw new AppError('Producto no encontrado', 'PRODUCTO_NOT_FOUND', 404);

        const imagenData: ProductoImagenCrear = {
            producto_id,
            url_imagen,
            es_principal,
            sku_id: null
        };

        return await this.repository.registrarImagen(imagenData);
    }
}
