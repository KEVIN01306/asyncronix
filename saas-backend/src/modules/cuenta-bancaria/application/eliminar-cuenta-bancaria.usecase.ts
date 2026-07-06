import AppError from '@shared/errors/AppError.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import type { CuentaBancariaRepository } from '../domain/cuenta-bancaria.repository.js';

export class EliminarCuentaBancariaUseCase {
    constructor(private readonly cuentaBancariaRepository: CuentaBancariaRepository) {}

    async execute(id: string, negocio_id: string): Promise<void> {
        try {
            await this.cuentaBancariaRepository.eliminar(id, negocio_id);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
