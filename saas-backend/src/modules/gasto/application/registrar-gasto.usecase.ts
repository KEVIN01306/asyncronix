import type { GastoSimple } from "../domain/gasto.entity.js";
import type { GastoRepository } from "../domain/gasto.reposity.js";
import type { GastoCrear } from "../domain/gasto.entity.js";

export class RegistrarGastoUseCase {

    constructor(
        private readonly gastoRepository: GastoRepository
    ) { }

    async execute(data: GastoCrear, negocio_id: string): Promise<GastoSimple> {
        const fecha = new Date()
        return await this.gastoRepository.registrar({ ...data, fecha }, negocio_id)
    }
}
