import AppError from "@shared/errors/AppError.js";
import type { CotizacionRepository } from "../domain/cotizacion.repository.js";
import type { CotizacionSimple } from "../domain/cotizacion.entity.js";

export class ActualizarEstadoCotizacionUseCase {
    constructor(private readonly repository: CotizacionRepository) {}

    async execute(id: string, estado: string, negocio_id: string, sucursal_id: string): Promise<CotizacionSimple> {
        if (!['ACEPTADA', 'RECHAZADA'].includes(estado)) {
            throw new AppError("Estado inválido para actualización manual. Solo ACEPTADA o RECHAZADA permitidos.", "INVALID_STATUS", 400);
        }

        const cotizacion = await this.repository.obtener(id, negocio_id, sucursal_id);
        if (!cotizacion) {
            throw new AppError("Cotización no encontrada.", "NOT_FOUND", 404);
        }

        if (cotizacion.estado !== 'PENDIENTE') {
            throw new AppError(`No se puede cambiar el estado de una cotización que ya está en estado ${cotizacion.estado}.`, "INVALID_OPERATION", 400);
        }

        const hoy = new Date();
        if (new Date(cotizacion.fecha_validez) < hoy) {
            throw new AppError("La cotización ha expirado y no puede ser aceptada ni rechazada.", "EXPIRED", 400);
        }

        return await this.repository.actualizarEstado(id, estado, negocio_id, sucursal_id);
    }
}
