import type { VarianteDetalle } from "../domain/variante.entity.js";
import type { VarianteRepository } from "../domain/variante.repository.js";

export class ActualizarCodigoBarrasVarianteUseCase {
    constructor(private readonly repository: VarianteRepository) { }

    async execute(id: string, negocio_id: string, codigo_barras: string | null): Promise<VarianteDetalle> {
        return await this.repository.actualizarCodigoBarras(id, codigo_barras, negocio_id);
    }
}
