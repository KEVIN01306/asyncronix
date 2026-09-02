import type { NegocioRepository } from "../domain/negocio.repository.js";
import type { NegocioFacturacionConfig } from "../domain/negocio-facturacion.entity.js";

export class ObtenerFacturacionNegocioUseCase {
    constructor(private readonly negocioRepository: NegocioRepository) {}

    async execute(negocio_id: string): Promise<NegocioFacturacionConfig | null> {
        return await this.negocioRepository.obtenerFacturacion(negocio_id);
    }
}
