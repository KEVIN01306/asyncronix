import type { GastoActualizar, GastoSimple } from "../domain/gasto.entity.js";
import type { GastoRepository } from "../domain/gasto.reposity.js";

export class ActualizarGastoUseCase {

    constructor(
        private readonly gastoRepository: GastoRepository
    ) { }

    async execute(id: string, negocio_id: string, data: GastoActualizar): Promise<GastoSimple> {
        return await this.gastoRepository.actualizar(id, data, negocio_id)
    }
}
