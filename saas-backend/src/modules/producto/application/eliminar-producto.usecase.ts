import type { ProductoRepository } from "../domain/producto.repository.js";
import ManejadorArchivos from "@shared/infrastructure/manejadorArchivos.utils.js";

export class EliminarProductoUseCase {
    constructor(private readonly repository: ProductoRepository) { }

    async execute(id: string, negocio_id: string): Promise<void> {
        const producto = await this.repository.obtener(id, negocio_id);
        if (producto?.imagenes?.length) {
            await Promise.all(producto.imagenes.map((imagen) => ManejadorArchivos.eliminarArchivo(imagen.url)));
        }

        await this.repository.eliminar(id, negocio_id);
    }
}
