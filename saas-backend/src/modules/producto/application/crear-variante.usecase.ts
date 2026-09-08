import type { VarianteCrear, VarianteDetalle } from "../domain/variante.entity.js";
import type { VarianteRepository } from "../domain/variante.repository.js";
import { LimiteNegocio } from "../../negocio/domain/negocio-limite.entity.js";
import type { ValidarLimiteNegocioUseCase } from "../../negocio/application/validar-limite-negocio.usecase.js";

import { UniqueConstraintError } from "@shared/database/errors/UniqueConstraintError.js";

export class CrearVarianteUseCase {
    constructor(
        private readonly repository: VarianteRepository,
        private readonly validarLimiteNegocioUseCase: ValidarLimiteNegocioUseCase
    ) { }

    async execute(variante: VarianteCrear, negocio_id: string): Promise<VarianteDetalle> {
        const cantidadActual = await this.repository.contar(negocio_id);
        await this.validarLimiteNegocioUseCase.execute(negocio_id, LimiteNegocio.VARIANTES, cantidadActual);

        let intentos = 0;
        const MAX_INTENTOS = 3;

        while (intentos < MAX_INTENTOS) {
            try {
                return await this.repository.crear(variante, negocio_id);
            } catch (error) {
                if (error instanceof UniqueConstraintError && intentos < MAX_INTENTOS - 1) {
                    intentos++;
                    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
                } else {
                    throw error;
                }
            }
        }
        
        throw new Error('No se pudo crear la variante después de varios intentos');
    }
}
