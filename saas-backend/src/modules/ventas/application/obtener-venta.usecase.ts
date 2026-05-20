import AppError from "../../../shared/errors/AppError.js";
import { DatabaseError } from "../../../shared/database/errors/DatabaseError.js";
import type { VentaRepository } from "../domain/venta.repository.js";
import type { VentaSimple } from "../domain/venta.entity.js";

export class ObtenerVentaUseCase {
    constructor(private readonly ventaRepository: VentaRepository) {}

    async execute(id: string, negocio_id: string): Promise<VentaSimple> {
        try {
            const venta = await this.ventaRepository.obtener(id, negocio_id);
            if (!venta) {
                throw new AppError("La venta no fue encontrada", "NOT_FOUND", 404);
            }
            return venta;
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
