import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { ServicioRepository } from "../domain/servicio.repository.js";
import type { ServicioDetalle } from "../domain/servicio.entity.js";
import { ESTADO_SERVICIO } from "../domain/servicio.constants.js";

export class FinalizarServicioUseCase {
    constructor(private readonly repository: ServicioRepository) { }

    async execute(
        id: string,
        negocio_id: string,
        firmaSalidaUrl: string,
        metodoPago: string,
        efectivoRecibido?: number | null,
        vuelto?: number | null
    ): Promise<ServicioDetalle> {
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

            if (metodoPago === 'EFECTIVO') {
                const total = Number(servicio.total ?? 0);
                const recibido = Number(efectivoRecibido ?? 0);
                const cambio = Number(vuelto ?? 0);

                if (efectivoRecibido == null) {
                    throw new AppError('El efectivo recibido es requerido para pagos en efectivo', 'EFECTIVO_RECIBIDO_REQUERIDO', 400);
                }

                if (vuelto == null) {
                    throw new AppError('El vuelto es requerido para pagos en efectivo', 'VUELTO_REQUERIDO', 400);
                }

                if (!Number.isFinite(recibido) || recibido < total) {
                    throw new AppError('El efectivo recibido es menor al total del servicio', 'PAGO_INSUFICIENTE', 400);
                }

                if (!Number.isFinite(cambio) || cambio < 0) {
                    throw new AppError('El vuelto debe ser un número válido mayor o igual a cero', 'VUELTO_INVALIDO', 400);
                }
            }

            return await this.repository.actualizar(id, negocio_id, {
                estado: ESTADO_SERVICIO.FINALIZADO,
                firma_salida: firmaSalidaUrl,
                MetodoPago: metodoPago as any,
                efectivo_recibido: metodoPago === 'EFECTIVO' ? Number(efectivoRecibido) : null,
                vuelto: metodoPago === 'EFECTIVO' ? Number(vuelto) : null,
                fecha_salida: new Date().toISOString()
            });
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
