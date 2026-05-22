import AppError from "../../../shared/errors/AppError.js";
import { DatabaseError } from "../../../shared/database/errors/DatabaseError.js";
import { PersistenceError } from '../../../shared/database/errors/PersistenceError.js';
import { VentaNotFoundPersistenceError } from '../../../shared/database/errors/VentaNotFoundPersistenceError.js';
import type { VentaRepository } from "../domain/venta.repository.js";

export class FinalizarVentaUseCase {
    constructor(private readonly ventaRepository: VentaRepository) {}

    async execute(ventaId: string, negocio_id: string, sucursal_id: string, metodo_pago?: string) {
        try {
            return await this.ventaRepository.finalizarVenta(ventaId, negocio_id, sucursal_id, metodo_pago as any);
        } catch (error: any) {
            if (error instanceof PersistenceError) {
                if (error instanceof VentaNotFoundPersistenceError) throw new AppError('La venta no existe', 'NOT_FOUND', 404);
                throw new AppError(error.message || 'Error de persistencia', 'PERSISTENCE_ERROR', 500);
            }
            if (error.message === 'VENTA_NO_PENDIENTE') {
                throw new AppError('Solo se puede finalizar una venta en estado PENDIENTE', 'BAD_REQUEST', 400);
            }
            if (error instanceof DatabaseError) throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
