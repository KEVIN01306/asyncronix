import type { VarianteDetalle } from "../domain/variante.entity.js";
import type { VarianteRepository } from "../domain/variante.repository.js";

export class GenerarQrVarianteUseCase {
    constructor(private readonly repository: VarianteRepository) { }

    async execute(id: string, negocio_id: string): Promise<VarianteDetalle> {
        return await this.repository.generarQr(id, negocio_id);
    }
}
