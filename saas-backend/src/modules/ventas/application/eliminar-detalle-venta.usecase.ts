import AppError from "../../../shared/errors/AppError.js";
import { DatabaseError } from "../../../shared/database/errors/DatabaseError.js";
import type { VentaRepository } from "../domain/venta.repository.js";

export class EliminarDetalleVentaUseCase {
    constructor(private readonly ventaRepository: VentaRepository) {}

    async execute(ventaId: string, detalleId: string, negocio_id: string, sucursal_id: string): Promise<void> {
        try {
            await this.ventaRepository.eliminarDetalle(ventaId, detalleId, negocio_id, sucursal_id);
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            if (error instanceof DatabaseError) throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
