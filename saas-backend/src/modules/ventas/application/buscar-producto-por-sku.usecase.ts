import AppError from "../../../shared/errors/AppError.js";
import type { VarianteDetalle } from "../../producto/domain/variante.entity.js";
import type { VarianteRepository } from "../../producto/domain/variante.repository.js";

export class BuscarProductoPorSkuUseCase {
    constructor(private readonly varianteRepository: VarianteRepository) {}

    async execute(sku: string, negocio_id: string): Promise<VarianteDetalle> {
        const variante = await this.varianteRepository.obtenerPorSku(sku, negocio_id);
        if (!variante) {
            throw new AppError('Variante no encontrada', 'VARIANTE_NO_ENCONTRADA', 404);
        }
        return variante;
    }
}
