import type { ProductoRepository } from "../domain/producto.repository.js";
import type { IStorageProvider } from "@shared/domain/providers/storage.provider.js";

export class EliminarProductoUseCase {
    constructor(
        private readonly repository: ProductoRepository,
        private readonly storageProvider: IStorageProvider
    ) { }

    async execute(id: string, negocio_id: string): Promise<void> {
        const producto = await this.repository.obtener(id, negocio_id);
        if (producto?.imagenes?.length) {
            await Promise.all(producto.imagenes.map((imagen) => this.storageProvider.deleteFile(imagen.url)));
        }

        await this.repository.eliminar(id, negocio_id);
    }
}
