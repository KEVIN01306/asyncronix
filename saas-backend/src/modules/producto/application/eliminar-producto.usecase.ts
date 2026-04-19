import type { ProductoRepository } from "../domain/producto.repository.js";
import fs from 'fs'
import path from 'path'

export class EliminarProductoUseCase {
    constructor(private readonly repository: ProductoRepository) { }

    async execute(id: string, negocio_id: string): Promise<void> {
        const producto = await this.repository.obtener(id, negocio_id);
        if (producto) {
            // Eliminar imágenes físicas
            for (const img of producto.imagenes) {
                const filePath = path.join(process.cwd(), img.url_imagen);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        }
        await this.repository.eliminar(id, negocio_id);
    }
}
