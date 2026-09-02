import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { ServicioRepository } from "../domain/servicio.repository.js";
import { ESTADO_SERVICIO } from "../domain/servicio.constants.js";
import type { CrearMediaUseCase } from "../../media/application/crear-media.usecase.js";
import type { FileDTO } from "@shared/domain/providers/storage.provider.js";

export class TerminarReparacionUseCase {
    constructor(
        private readonly repository: ServicioRepository, 
        private readonly crearMediaUseCase?: CrearMediaUseCase
    ) {}

    async execute(servicio_id: string, reparacion_id: string, file: FileDTO, negocio_id: string) {
        try {
            const servicio = await this.repository.obtener(servicio_id, negocio_id);
            if (!servicio) throw new AppError('Servicio no encontrado', 'NOT_FOUND', 404);

            if (servicio.estado !== ESTADO_SERVICIO.EN_REPARACION) {
                throw new AppError('El servicio no se encuentra en reparación', 'BAD_REQUEST', 400);
            }

            const activeReparacion = servicio.servicioReparacion?.find(r => r.id === reparacion_id);
            if (!activeReparacion) {
                throw new AppError('No se encontró la reparación activa especificada', 'NOT_FOUND', 404);
            }
            if (activeReparacion.fecha_salida) {
                throw new AppError('La reparación especificada ya fue finalizada', 'BAD_REQUEST', 400);
            }

            let firma_url = '';
            if (this.crearMediaUseCase) {
                const path = `tenant_${negocio_id}/services/vehiculo/srv_${servicio_id}/reparaciones`;
                const filename = `firma_salida_reparacion_${Date.now()}.png`;
                firma_url = await this.crearMediaUseCase.execute(file, negocio_id, path, filename);
            }

            // Actualizamos la reparación
            await this.repository.actualizarReparacion(reparacion_id, {
                fecha_salida: new Date(),
                firma_salida: firma_url
            }, negocio_id);

            // Cambiamos el estado del servicio de vuelta a EN_SERVICIO
            const svDetalle = await this.repository.cambiarEstado(servicio_id, negocio_id, ESTADO_SERVICIO.EN_SERVICIO);

            return { servicio: svDetalle, estado: ESTADO_SERVICIO.EN_SERVICIO };
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error al terminar reparación', 'DATABASE_ERROR', 500);
        }
    }
}
