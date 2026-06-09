import type { VarianteRepository } from "../domain/variante.repository.js";

export class EliminarVarianteUseCase {
    constructor(private readonly repository: VarianteRepository) { }

    async execute(id: string, negocio_id: string): Promise<void> {
        await this.repository.eliminar(id, negocio_id);
    }
}
