import type { VarianteCrear, VarianteDetalle } from "../domain/variante.entity.js";
import type { VarianteRepository } from "../domain/variante.repository.js";
import { LimiteNegocio } from "../../negocio/domain/negocio-limite.entity.js";
import type { ValidarLimiteNegocioUseCase } from "../../negocio/application/validar-limite-negocio.usecase.js";

export class CrearVarianteUseCase {
    constructor(
        private readonly repository: VarianteRepository,
        private readonly validarLimiteNegocioUseCase: ValidarLimiteNegocioUseCase
    ) { }

    async execute(variante: VarianteCrear, negocio_id: string): Promise<VarianteDetalle> {
        const cantidadActual = await this.repository.contar(negocio_id);
        await this.validarLimiteNegocioUseCase.execute(negocio_id, LimiteNegocio.VARIANTES, cantidadActual);

        return await this.repository.crear(variante, negocio_id);
    }
}
