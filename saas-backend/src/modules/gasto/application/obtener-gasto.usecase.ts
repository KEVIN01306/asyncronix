import AppError from "@shared/errors/AppError.js";
import type { GastoDetalle } from "../domain/gasto.entity.js";
import type { GastoRepository } from "../domain/gasto.reposity.js";

interface ObtenerGastoParams {
    id: string
    negocio_id: string
}

export class ObtenerGastoUseCase {

    constructor(
        private readonly gastoRepository: GastoRepository
    ) { }

    async execute({ id, negocio_id }: ObtenerGastoParams): Promise<GastoDetalle | null> {
        const gasto = await this.gastoRepository.obtener(id, negocio_id)
        if (!gasto) throw new AppError('Gasto no encontrado', 'GASTO_NOT_FOUND', 404)
        return gasto
    }
}
