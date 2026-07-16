import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { VehiculoRepository } from "../domain/vehiculo.repository.js";
import type { VehiculoCrear } from "../domain/vehiculo.entity.js";
import { LimiteNegocio } from "../../negocio/domain/negocio-limite.entity.js";
import type { ValidarLimiteNegocioUseCase } from "../../negocio/application/validar-limite-negocio.usecase.js";

export class RegistrarVehiculoUseCase {
    constructor(
        private readonly repository: VehiculoRepository,
        private readonly validarLimiteNegocioUseCase: ValidarLimiteNegocioUseCase
    ) { }

    async execute(data: VehiculoCrear, negocio_id: string) {
        try {
            const cantidadActual = await this.repository.contar(negocio_id);
            await this.validarLimiteNegocioUseCase.execute(negocio_id, LimiteNegocio.VEHICULOS, cantidadActual);

            return await this.repository.crear(data, negocio_id);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
