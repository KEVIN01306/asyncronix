import AppError from "../../../shared/errors/AppError.js";
import { DatabaseError } from "../../../shared/database/errors/DatabaseError.js";
import { PersistenceError } from '../../../shared/database/errors/PersistenceError.js';
import { VentaNotFoundPersistenceError } from '../../../shared/database/errors/VentaNotFoundPersistenceError.js';
import type { VentaRepository } from "../domain/venta.repository.js";
import type { VentaActualizar, VentaSimple } from "../domain/venta.entity.js";

export class ActualizarVentaUseCase {
    constructor(private readonly ventaRepository: VentaRepository) {}

    async execute(id: string, data: VentaActualizar, negocio_id: string, sucursal_id: string): Promise<VentaSimple> {
        try {
            return await this.ventaRepository.actualizar(id, data, negocio_id, sucursal_id);
        } catch (error: any) {
            if (error instanceof PersistenceError) {
                if (error instanceof VentaNotFoundPersistenceError) throw new AppError('La venta no existe', 'NOT_FOUND', 404);
                throw new AppError(error.message || 'Error de persistencia', 'PERSISTENCE_ERROR', 500);
            }
            if (error.message === "VENTA_NO_EDITABLE") {
                throw new AppError("No se puede editar una venta completada o anulada", "BAD_REQUEST", 400);
            }
            if (error instanceof DatabaseError) {
                throw new AppError(`Error en base de datos al actualizar venta: ${error.message}`, 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
