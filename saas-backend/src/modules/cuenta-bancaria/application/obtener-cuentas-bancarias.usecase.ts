import AppError from '@shared/errors/AppError.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import type { Paginated } from '@shared/domain/paginated.js';
import type { CuentaBancariaSimple } from '../domain/cuenta-bancaria.entity.js';
import type { CuentaBancariaRepository } from '../domain/cuenta-bancaria.repository.js';

export class ObtenerCuentasBancariasUseCase {
    constructor(private readonly cuentaBancariaRepository: CuentaBancariaRepository) {}

    async execute(negocio_id: string, page: number, perPage: number, q?: string): Promise<Paginated<CuentaBancariaSimple>> {
        try {
            return await this.cuentaBancariaRepository.listar(negocio_id, { page, perPage }, q);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
