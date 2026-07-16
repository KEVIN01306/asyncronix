import AppError from '@shared/errors/AppError.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import type { CajaCrear, CajaObtenidoDetalle } from '../domain/caja.entity.js';
import type { CajaRepository } from '../domain/caja.repository.js';
import { LimiteNegocio } from "../../negocio/domain/negocio-limite.entity.js";
import type { ValidarLimiteNegocioUseCase } from "../../negocio/application/validar-limite-negocio.usecase.js";

export class RegistrarCajaUseCase {
    constructor(
        private readonly cajaRepository: CajaRepository,
        private readonly validarLimiteNegocioUseCase: ValidarLimiteNegocioUseCase
    ) {}

    async execute(data: CajaCrear, negocio_id: string, sucursal_id: string): Promise<CajaObtenidoDetalle> {
        try {
            const cantidadActual = await this.cajaRepository.contar(negocio_id);
            await this.validarLimiteNegocioUseCase.execute(negocio_id, LimiteNegocio.CAJAS, cantidadActual);

            return await this.cajaRepository.registrar(data, negocio_id, sucursal_id);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
