import type { VarianteDetalle } from "../domain/variante.entity.js";
import type { VarianteRepository } from "../domain/variante.repository.js";

export class SubirImagenVarianteUseCase {
    constructor(private readonly repository: VarianteRepository) { }

    async execute(id: string, url_imagen: string, negocio_id: string): Promise<VarianteDetalle> {
        return await this.repository.subirImagen(id, url_imagen, negocio_id);
    }
}
