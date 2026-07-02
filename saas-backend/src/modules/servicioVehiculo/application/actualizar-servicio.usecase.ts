import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { ServicioRepository } from "../domain/servicio.repository.js";
import type { ServicioActualizar, ServicioDetalle } from "../domain/servicio.entity.js";

export class ActualizarServicioUseCase {
    constructor(private readonly repository: ServicioRepository) { }

    async execute(id: string, negocio_id: string, data: ServicioActualizar): Promise<ServicioDetalle> {
        try {
            // obtener servicio actual
            const current = await this.repository.obtener(id, negocio_id);
            if (!current) throw new AppError('Servicio no encontrado', 'NOT_FOUND', 404);

            const viejoTipo = current.tipo_servicio_id ?? null;
            const nuevoTipo = (data.tipo_servicio_id ?? null) as string | null;

            // Si cambió el tipo de servicio, reiniciar tareas
            if (nuevoTipo !== viejoTipo) {
                await this.repository.eliminarTareasNoExtra(id, negocio_id);
                if (nuevoTipo) {
                    await this.repository.crearTareasDesdeTipoServicio(id, nuevoTipo, negocio_id);
                }
            }

            const servicioActualizado = await this.repository.actualizar(id, negocio_id, data);
            await this.repository.actualizarChecklistRespuestasPorTipoServicio(id, nuevoTipo, negocio_id);

            return servicioActualizado;
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
