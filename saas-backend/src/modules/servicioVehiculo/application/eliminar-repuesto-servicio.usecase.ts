import AppError from '../../../shared/errors/AppError.js';
import { DatabaseError } from '../../../shared/database/errors/DatabaseError.js';
import type { ServicioRepository } from '../domain/servicio.repository.js';

export class EliminarServicioRepuestoUseCase {
    constructor(private readonly repository: ServicioRepository) { }

    async execute(servicioId: string, repuestoId: string, negocio_id: string, sucursal_id: string): Promise<void> {
        try {
            await this.repository.eliminarRepuesto(repuestoId, servicioId, negocio_id, sucursal_id);
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}

export default EliminarServicioRepuestoUseCase;
