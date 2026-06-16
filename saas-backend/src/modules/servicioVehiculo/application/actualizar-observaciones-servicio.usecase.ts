import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { ServicioRepository } from "../domain/servicio.repository.js";
import type { ServicioDetalle } from "../domain/servicio.entity.js";
import { ESTADO_SERVICIO } from "../domain/servicio.constants.js";

export class ActualizarObservacionesServicioUseCase {
    constructor(private readonly repository: ServicioRepository) { }

    async execute(id: string, negocio_id: string, observaciones: string | null, userPermisos: string[]): Promise<ServicioDetalle> {
        try {
            const servicio = await this.repository.obtener(id, negocio_id);
            if (!servicio) throw new AppError('Servicio no encontrado', 'NOT_FOUND', 404);

            const estadosPermitidos = [ESTADO_SERVICIO.EN_SERVICIO, ESTADO_SERVICIO.EN_PRUEBAS];
            if (!estadosPermitidos.includes(servicio.estado as any)) {
                throw new AppError(
                    'No se pueden actualizar observaciones en este estado',
                    'INVALID_STATE',
                    400
                );
            }

            if (servicio.estado === ESTADO_SERVICIO.EN_PRUEBAS) {
                if (!userPermisos.includes('ADMIN_SERVICIOS')) {
                    throw new AppError(
                        'Solo administradores pueden editar observaciones en estado EN_PRUEBAS',
                        'INSUFFICIENT_PERMISSIONS',
                        403
                    );
                }
            }

            return await this.repository.actualizarObservaciones(id, negocio_id, observaciones);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
