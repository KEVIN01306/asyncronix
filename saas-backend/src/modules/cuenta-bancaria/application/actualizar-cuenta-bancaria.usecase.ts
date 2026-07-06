import AppError from '@shared/errors/AppError.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import type { CuentaBancariaActualizar, CuentaBancariaObtenidoDetalle } from '../domain/cuenta-bancaria.entity.js';
import type { CuentaBancariaRepository } from '../domain/cuenta-bancaria.repository.js';

export class ActualizarCuentaBancariaUseCase {
    constructor(private readonly cuentaBancariaRepository: CuentaBancariaRepository) {}

    async execute(id: string, negocio_id: string, data: CuentaBancariaActualizar): Promise<CuentaBancariaObtenidoDetalle> {
        try {
            return await this.cuentaBancariaRepository.actualizar(id, negocio_id, data);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
