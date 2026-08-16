import AppError from "@shared/errors/AppError.js";
import type { CotizacionRepository } from "../domain/cotizacion.repository.js";
import type { CotizacionCompleta } from "../domain/cotizacion.entity.js";

export class ObtenerCotizacionUseCase {
    constructor(private readonly repository: CotizacionRepository) {}

    async execute(id: string, negocio_id: string, sucursal_id: string): Promise<CotizacionCompleta> {
        const cotizacion = await this.repository.obtener(id, negocio_id, sucursal_id);
        if (!cotizacion) {
            throw new AppError("Cotización no encontrada.", "NOT_FOUND", 404);
        }

        const hoy = new Date();
        if (cotizacion.estado === 'PENDIENTE' && new Date(cotizacion.fecha_validez) < hoy) {
            await this.repository.actualizarEstado(id, 'VENCIDA', negocio_id, sucursal_id);
            cotizacion.estado = 'VENCIDA';
        }

        return cotizacion;
    }
}
