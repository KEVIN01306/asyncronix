import AppError from '@shared/errors/AppError.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import type { CuentaBancariaCrear, CuentaBancariaObtenidoDetalle } from '../domain/cuenta-bancaria.entity.js';
import type { CuentaBancariaRepository } from '../domain/cuenta-bancaria.repository.js';
import { LimiteNegocio } from "../../negocio/domain/negocio-limite.entity.js";
import type { ValidarLimiteNegocioUseCase } from "../../negocio/application/validar-limite-negocio.usecase.js";

export class RegistrarCuentaBancariaUseCase {
    constructor(
        private readonly cuentaBancariaRepository: CuentaBancariaRepository,
        private readonly validarLimiteNegocioUseCase: ValidarLimiteNegocioUseCase
    ) {}

    async execute(data: CuentaBancariaCrear, negocio_id: string): Promise<CuentaBancariaObtenidoDetalle> {
        try {
            const cantidadActual = await this.cuentaBancariaRepository.contar(negocio_id);
            await this.validarLimiteNegocioUseCase.execute(negocio_id, LimiteNegocio.CUENTAS_BANCARIAS, cantidadActual);

            return await this.cuentaBancariaRepository.registrar(data, negocio_id);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
