import type { NegocioRepository } from "../domain/negocio.repository.js";
import type { NegocioFacturacionConfig, NegocioFacturacionConfigActualizar } from "../domain/negocio-facturacion.entity.js";

export class ActualizarFacturacionNegocioUseCase {
    constructor(private readonly negocioRepository: NegocioRepository) {}

    async execute(negocio_id: string, data: NegocioFacturacionConfigActualizar): Promise<NegocioFacturacionConfig> {
        return await this.negocioRepository.upsertFacturacion(negocio_id, data);
    }
}
