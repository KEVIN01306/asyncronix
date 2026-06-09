import type { VarianteDetalle } from "../domain/variante.entity.js";
import type { VarianteRepository } from "../domain/variante.repository.js";

export class ObtenerVarianteUseCase {
    constructor(private readonly repository: VarianteRepository) { }

    async execute(id: string, negocio_id: string): Promise<VarianteDetalle | null> {
        return await this.repository.obtener(id, negocio_id);
    }
}
