import type { GastoRepository } from "../domain/gasto.reposity.js";

export class EliminarGastoUseCase {

    constructor(
        private readonly gastoRepository: GastoRepository
    ) { }

    async execute(id: string, negocio_id: string): Promise<void> {
        await this.gastoRepository.eliminar(id, negocio_id)
    }
}
