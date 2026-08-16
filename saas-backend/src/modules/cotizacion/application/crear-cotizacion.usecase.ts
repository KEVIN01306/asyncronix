import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { CotizacionRepository } from "../domain/cotizacion.repository.js";
import type { CotizacionCrear, CotizacionCompleta } from "../domain/cotizacion.entity.js";

export class CrearCotizacionUseCase {
    constructor(private readonly repository: CotizacionRepository) {}

    async execute(data: CotizacionCrear, negocio_id: string, sucursal_id: string, usuario_id: string): Promise<CotizacionCompleta> {
        if (!data.detalles || data.detalles.length === 0) {
            throw new AppError("La cotización debe tener al menos un detalle.", "COTIZACION_SIN_DETALLES", 400);
        }

        try {
            return await this.repository.crear(data, negocio_id, sucursal_id, usuario_id);
        } catch (error: any) {
            if (error instanceof DatabaseError) {
                throw new AppError(`Error al crear cotización: ${error.message}`, "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
