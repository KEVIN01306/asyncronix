import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { ServicioRepository } from "../domain/servicio.repository.js";
import type { ServicioDetalle } from "../domain/servicio.entity.js";
import { ESTADO_SERVICIO } from "../domain/servicio.constants.js";

export class FinalizarServicioUseCase {
    constructor(private readonly repository: ServicioRepository) { }

    async execute(id: string, negocio_id: string, firmaSalidaUrl: string, metodoPago: string): Promise<ServicioDetalle> {
        try {
            const servicio = await this.repository.obtener(id, negocio_id);
            if (!servicio) throw new AppError('Servicio no encontrado', 'NOT_FOUND', 404);

            if (servicio.estado !== ESTADO_SERVICIO.LISTO_ENTREGA) {
                throw new AppError('El servicio no está en estado LISTO_ENTREGA', 'INVALID_STATE', 400);
            }

            if (!firmaSalidaUrl) {
                throw new AppError('La firma del cliente es requerida', 'FIRMA_REQUERIDA', 400);
            }

            if (!metodoPago) {
                throw new AppError('El método de pago es requerido', 'METODO_PAGO_REQUERIDO', 400);
            }

            return await this.repository.actualizar(id, negocio_id, {
                estado: ESTADO_SERVICIO.FINALIZADO,
                firma_salida: firmaSalidaUrl,
                MetodoPago: metodoPago as any,
                fecha_salida: new Date().toISOString()
            });
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
