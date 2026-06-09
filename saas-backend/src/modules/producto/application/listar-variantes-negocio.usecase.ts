import type { VarianteDetalle } from '../domain/variante.entity.js';
import type { VarianteRepository } from '../domain/variante.repository.js';

export class ListarVariantesNegocioUseCase {
    constructor(private readonly repository: VarianteRepository) { }

    async execute(negocio_id: string, sucursal_id?: string): Promise<VarianteDetalle[]> {
        return await this.repository.listarPorNegocio(negocio_id, sucursal_id);
    }
}
