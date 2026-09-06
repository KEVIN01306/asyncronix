import AppError from "../../../shared/errors/AppError.js";
import { DatabaseError } from "../../../shared/database/errors/DatabaseError.js";
import { PersistenceError } from '../../../shared/database/errors/PersistenceError.js';
import { VentaNotFoundPersistenceError } from '../../../shared/database/errors/VentaNotFoundPersistenceError.js';
import type { VentaRepository } from "../domain/venta.repository.js";
import type { VentaSimple } from "../domain/venta.entity.js";
import type { FacturaRepository } from "../../facturacion/domain/interfaces/factura.repository.js";
import type { AnularFacturaUseCase } from "../../facturacion/application/use-cases/anular-factura.usecase.js";

export class AnularVentaUseCase {
    constructor(
        private readonly ventaRepository: VentaRepository,
        private readonly facturaRepository: FacturaRepository,
        private readonly anularFacturaUseCase: AnularFacturaUseCase
    ) {}

    async execute(id: string, negocio_id: string, sucursal_id: string, comentario: string): Promise<VentaSimple> {
        if (!comentario || comentario.trim().length === 0) {
            throw new AppError('El comentario es obligatorio para anular la venta', 'COMENTARIO_REQUERIDO', 400);
        }

        try {
            // Verificar si hay factura certificada asociada a la venta
            const factura = await this.facturaRepository.obtenerPorVentaId(id);
            
            if (factura && factura.estado === 'CERTIFICADA' && factura.dte_uuid) {
                // Delegamos la anulación de la factura electrónica al caso de uso correspondiente
                await this.anularFacturaUseCase.execute(factura.id, negocio_id, comentario);
            }

            return await this.ventaRepository.anular(id, negocio_id, sucursal_id, comentario);
        } catch (error: any) {
            if (error instanceof PersistenceError) {
                if (error instanceof VentaNotFoundPersistenceError) throw new AppError('La venta no existe', 'NOT_FOUND', 404);
                throw new AppError(error.message || 'Error de persistencia', 'PERSISTENCE_ERROR', 500);
            }
            if (error.message === "VENTA_YA_ANULADA") {
                throw new AppError("La venta ya ha sido anulada previamente", "BAD_REQUEST", 400);
            }
            if (error instanceof DatabaseError) {
                throw new AppError(`Error en base de datos al anular venta: ${error.message}`, 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
