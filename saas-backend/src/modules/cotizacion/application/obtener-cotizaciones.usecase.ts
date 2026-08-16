import type { CotizacionRepository } from "../domain/cotizacion.repository.js";
import type { CotizacionSimple } from "../domain/cotizacion.entity.js";
import type { Paginated } from "@shared/domain/paginated.js";
import type { Pagination } from "@shared/domain/pagination.js";
import AppError from "@shared/errors/AppError.js";

export class ObtenerCotizacionesUseCase {
    constructor(private readonly repository: CotizacionRepository) {}

    async execute(negocio_id: string, sucursal_id: string, pagination: Pagination, q?: string, estado?: string, cliente_id?: string): Promise<Paginated<CotizacionSimple>> {
        const result = await this.repository.listar(negocio_id, sucursal_id, pagination, q, estado, cliente_id);
        
        // Regla de negocio: Actualización automática de estado VENCIDA
        const hoy = new Date();
        for (const item of result.data) {
            if (item.estado === 'PENDIENTE' && new Date(item.fecha_validez) < hoy) {
                // Actualizar a vencida en la base de datos
                await this.repository.actualizarEstado(item.id, 'VENCIDA', negocio_id, sucursal_id);
                item.estado = 'VENCIDA'; // Reflejar en la respuesta
            }
        }
        
        return result;
    }
}
