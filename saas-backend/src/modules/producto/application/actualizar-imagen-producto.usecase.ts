import type { ProductoImagen, ProductoImagenActualizar } from "../domain/producto.entity.js";
import type { ProductoRepository } from "../domain/producto.repository.js";
import AppError from "@shared/errors/AppError.js";

export class ActualizarImagenProductoUseCase {
    constructor(private readonly repository: ProductoRepository) { }

    async execute(id: string, data: ProductoImagenActualizar): Promise<ProductoImagen> {
        const imagen = await this.repository.obtenerImagen(id);
        if (!imagen) throw new AppError('Imagen no encontrada', 'IMAGEN_NOT_FOUND', 404);

        return await this.repository.actualizarImagen(id, data);
    }
}
