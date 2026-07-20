import AppError from "@shared/errors/AppError.js";
import type { FileDTO } from "@shared/domain/providers/storage.provider.js";
import type { ReemplazarMediaUseCase } from "../../media/application/reemplazar-media.usecase.js";
import type { ImagenProducto } from "../domain/producto.entity.js";
import type { ProductoRepository } from "../domain/producto.repository.js";

export class ActualizarArchivoImagenProductoUseCase {
    constructor(
        private readonly repository: ProductoRepository,
        private readonly reemplazarMediaUseCase: ReemplazarMediaUseCase
    ) { }

    async execute(imagen_id: string, file: FileDTO, negocio_id: string): Promise<ImagenProducto> {
        const imagen = await this.repository.obtenerImagen(imagen_id, negocio_id);
        if (!imagen) throw new AppError('Imagen no encontrada', 'IMAGEN_NOT_FOUND', 404);

        const path = `tenant_${negocio_id}/products/prod_${imagen.producto_id}`;
        const url = await this.reemplazarMediaUseCase.execute(file, negocio_id, path, undefined, imagen.url);
        return this.repository.actualizarArchivoImagen(imagen_id, url, negocio_id);
    }
}
