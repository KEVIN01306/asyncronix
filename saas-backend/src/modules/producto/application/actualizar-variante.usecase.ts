import type { VarianteActualizar, VarianteDetalle } from "../domain/variante.entity.js";
import type { VarianteRepository } from "../domain/variante.repository.js";

export class ActualizarVarianteUseCase {
    constructor(private readonly repository: VarianteRepository) { }

    async execute(id: string, negocio_id: string, variante: VarianteActualizar): Promise<VarianteDetalle> {
        return await this.repository.actualizar(id, variante, negocio_id);
    }
}
