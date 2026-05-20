import AppError from "../../../shared/errors/AppError.js";
import { DatabaseError } from "../../../shared/database/errors/DatabaseError.js";
import type { VentaRepository } from "../domain/venta.repository.js";
import type { VentaSimple } from "../domain/venta.entity.js";

export class AnularVentaUseCase {
    constructor(private readonly ventaRepository: VentaRepository) {}

    async execute(id: string, negocio_id: string): Promise<VentaSimple> {
        try {
            return await this.ventaRepository.anular(id, negocio_id);
        } catch (error: any) {
            if (error.message === "VENTA_NO_ENCONTRADA") {
                throw new AppError("La venta no existe", "NOT_FOUND", 404);
            }
            if (error.message === "VENTA_YA_ANULADA") {
                throw new AppError("La venta ya ha sido anulada previamente", "BAD_REQUEST", 400);
            }
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos al anular venta', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
