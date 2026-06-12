import AppError from "@shared/errors/AppError.js";
import type { VarianteRepository } from "../domain/variante.repository.js";
import type { VarianteDetalle } from "../domain/variante.entity.js";

export class BuscarVariantePorCodigoUseCase {
    constructor(private readonly varianteRepository: VarianteRepository) {}

    async execute(codigo: string, negocio_id: string): Promise<VarianteDetalle> {
        const variante = await this.varianteRepository.obtenerPorCodigo(codigo, negocio_id);
        if (!variante) {
            throw new AppError('Variante no encontrada', 'VARIANTE_NO_ENCONTRADA', 404);
        }
        return variante;
    }
}
