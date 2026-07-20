import AppError from "@shared/errors/AppError.js";
import type { IStorageProvider, FileDTO } from "@shared/domain/providers/storage.provider.js";
import type { ImagenProducto } from "../domain/producto.entity.js";
import type { ProductoRepository } from "../domain/producto.repository.js";

export class ActualizarArchivoImagenProductoUseCase {
    constructor(
        private readonly repository: ProductoRepository,
        private readonly storageProvider: IStorageProvider
    ) { }

    async execute(imagen_id: string, file: FileDTO, negocio_id: string): Promise<ImagenProducto> {
        const imagen = await this.repository.obtenerImagen(imagen_id, negocio_id);
        if (!imagen) throw new AppError('Imagen no encontrada', 'IMAGEN_NOT_FOUND', 404);

        const path = `tenant_${negocio_id}/products/prod_${imagen.producto_id}`;
        let url: string;
        
        if (this.storageProvider.replaceFile) {
            url = await this.storageProvider.replaceFile(imagen.url, file, path);
        } else {
            await this.storageProvider.deleteFile(imagen.url);
            url = await this.storageProvider.uploadFile(file, path);
        }
        return this.repository.actualizarArchivoImagen(imagen_id, url, negocio_id);
    }
}
