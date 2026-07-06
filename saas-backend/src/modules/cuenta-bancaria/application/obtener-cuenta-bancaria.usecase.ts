import AppError from '@shared/errors/AppError.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import type { CuentaBancariaObtenidoDetalle } from '../domain/cuenta-bancaria.entity.js';
import type { CuentaBancariaRepository } from '../domain/cuenta-bancaria.repository.js';

export class ObtenerCuentaBancariaUseCase {
    constructor(private readonly cuentaBancariaRepository: CuentaBancariaRepository) {}

    async execute(id: string, negocio_id: string): Promise<CuentaBancariaObtenidoDetalle> {
        try {
            const cuenta = await this.cuentaBancariaRepository.obtener(id, negocio_id);
            if (!cuenta) {
                throw new AppError('No se encontró la cuenta bancaria', 'DATA_NOT_FOUND', 404);
            }
            return cuenta;
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
