import type { ProductoRepository } from "../domain/producto.repository.js";
import fs from 'fs'
import path from 'path'

export class EliminarImagenesProductoUseCase {
    constructor(private readonly repository: ProductoRepository) { }

    async execute(ids: string[]): Promise<void> {
        for (const id of ids) {
            const imagen = await this.repository.obtenerImagen(id);
            if (imagen) {
                const filePath = path.join(process.cwd(), imagen.url_imagen);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        }

        await this.repository.eliminarImagenesBulk(ids);
    }
}
