import type { VarianteCrear, VarianteDetalle } from "../domain/variante.entity.js";
import type { VarianteRepository } from "../domain/variante.repository.js";

export class CrearVarianteUseCase {
    constructor(private readonly repository: VarianteRepository) { }

    async execute(variante: VarianteCrear, negocio_id: string): Promise<VarianteDetalle> {
        return await this.repository.crear(variante, negocio_id);
    }
}
