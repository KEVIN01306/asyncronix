import type { ProductoRepository } from "../domain/producto.repository.js";
import AppError from "@shared/errors/AppError.js";
import type { IStorageProvider } from "@shared/domain/providers/storage.provider.js";

export class EliminarImagenProductoUseCase {
    constructor(
        private readonly repository: ProductoRepository,
        private readonly storageProvider: IStorageProvider
    ) { }

    async execute(imagen_id: string, negocio_id: string): Promise<void> {
        const imagen = await this.repository.obtenerImagen(imagen_id, negocio_id);
        if (!imagen) throw new AppError('Imagen no encontrada', 'IMAGEN_NOT_FOUND', 404);
        if (imagen.es_principal) {
            throw new AppError('No es posible eliminar la imagen principal del producto.', 'IMAGEN_PRINCIPAL_NO_ELIMINABLE', 400);
        }

        await this.storageProvider.deleteFile(imagen.url);

        await this.repository.eliminarImagen(imagen_id, negocio_id);
    }
}
