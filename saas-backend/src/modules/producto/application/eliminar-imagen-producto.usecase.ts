import type { ProductoRepository } from "../domain/producto.repository.js";
import AppError from "@shared/errors/AppError.js";
import fs from 'fs'
import path from 'path'

export class EliminarImagenProductoUseCase {
    constructor(private readonly repository: ProductoRepository) { }

    async execute(id: string): Promise<void> {
        const imagen = await this.repository.obtenerImagen(id);
        if (!imagen) throw new AppError('Imagen no encontrada', 'IMAGEN_NOT_FOUND', 404);

        // Eliminar archivo físico
        const filePath = path.join(process.cwd(), imagen.url_imagen);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await this.repository.eliminarImagen(id);
    }
}
