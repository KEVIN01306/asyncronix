import type { ProductoRepository } from "../domain/producto.repository.js";
import type { EliminarMediaUseCase } from "../../media/application/eliminar-media.usecase.js";

export class EliminarProductoUseCase {
    constructor(
        private readonly repository: ProductoRepository,
        private readonly eliminarMediaUseCase: EliminarMediaUseCase
    ) { }

    async execute(id: string, negocio_id: string): Promise<void> {
        const producto = await this.repository.obtener(id, negocio_id);
        if (producto?.imagenes?.length) {
            await Promise.all(producto.imagenes.map((imagen) => this.eliminarMediaUseCase.execute(imagen.url, negocio_id)));
        }

        await this.repository.eliminar(id, negocio_id);
    }
}
