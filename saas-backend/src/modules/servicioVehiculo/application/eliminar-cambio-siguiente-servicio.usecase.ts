import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { ServicioRepository } from "../domain/servicio.repository.js";
import { ESTADO_SERVICIO } from "../domain/servicio.constants.js";

export class EliminarCambioSiguienteServicioUseCase {
    constructor(private readonly repository: ServicioRepository) { }

    async execute(id: string, servicio_id: string, negocio_id: string, userPermisos: string[]): Promise<void> {
        try {
            const servicio = await this.repository.obtener(servicio_id, negocio_id);
            if (!servicio) throw new AppError('Servicio no encontrado', 'NOT_FOUND', 404);

            const isAdmin = userPermisos.includes('ADMIN_SERVICIOS');
            const esEstadoEditable = [
                ESTADO_SERVICIO.EN_SERVICIO,
                ESTADO_SERVICIO.EN_PRUEBAS
            ].includes(servicio.estado as any);

            if (!esEstadoEditable) {
                throw new AppError('No se pueden eliminar cambios para el siguiente servicio en este estado', 'INVALID_STATE', 400);
            }

            const requiereAdmin =
                servicio.estado === ESTADO_SERVICIO.EN_PRUEBAS;

            if (requiereAdmin && !isAdmin) {
                throw new AppError('Solo administradores pueden eliminar cambios en estado EN_PRUEBAS', 'INSUFFICIENT_PERMISSIONS', 403);
            }

            await this.repository.eliminarCambioSiguienteServicio(id, servicio_id, negocio_id);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
