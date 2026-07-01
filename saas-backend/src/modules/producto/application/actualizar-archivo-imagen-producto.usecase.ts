import AppError from "@shared/errors/AppError.js";
import ManejadorArchivos from "@shared/infrastructure/manejadorArchivos.utils.js";
import type { ImagenProducto } from "../domain/producto.entity.js";
import type { ProductoRepository } from "../domain/producto.repository.js";

export class ActualizarArchivoImagenProductoUseCase {
    constructor(private readonly repository: ProductoRepository) { }

    async execute(imagen_id: string, url: string, negocio_id: string): Promise<ImagenProducto> {
        const imagen = await this.repository.obtenerImagen(imagen_id, negocio_id);
        if (!imagen) throw new AppError('Imagen no encontrada', 'IMAGEN_NOT_FOUND', 404);

        await ManejadorArchivos.eliminarArchivo(imagen.url);
        return this.repository.actualizarArchivoImagen(imagen_id, url, negocio_id);
    }
}
