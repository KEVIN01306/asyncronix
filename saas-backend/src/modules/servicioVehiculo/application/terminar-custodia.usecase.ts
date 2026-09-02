import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { ServicioRepository } from "../domain/servicio.repository.js";
import { ESTADO_SERVICIO } from "../domain/servicio.constants.js";
import type { CrearMediaUseCase } from "../../media/application/crear-media.usecase.js";
import type { FileDTO } from "@shared/domain/providers/storage.provider.js";

export class TerminarCustodiaUseCase {
    constructor(
        private readonly repository: ServicioRepository, 
        private readonly crearMediaUseCase?: CrearMediaUseCase
    ) {}

    async execute(servicio_id: string, custodia_id: string, file: FileDTO, negocio_id: string) {
        try {
            const servicio = await this.repository.obtener(servicio_id, negocio_id);
            if (!servicio) throw new AppError('Servicio no encontrado', 'NOT_FOUND', 404);

            if (servicio.estado !== ESTADO_SERVICIO.EN_CUSTODIA) {
                throw new AppError('El servicio no se encuentra en custodia', 'BAD_REQUEST', 400);
            }

            const activeCustody = servicio.servicioCustodias?.find(c => c.id === custodia_id);
            if (!activeCustody) {
                throw new AppError('No se encontró la custodia activa especificada', 'NOT_FOUND', 404);
            }
            if (activeCustody.fecha_salida) {
                throw new AppError('La custodia especificada ya fue finalizada', 'BAD_REQUEST', 400);
            }

            let firma_url = '';
            if (this.crearMediaUseCase) {
                const path = `tenant_${negocio_id}/services/vehiculo/srv_${servicio_id}/custodias`;
                const filename = `firma_salida_custodia_${Date.now()}.png`;
                firma_url = await this.crearMediaUseCase.execute(file, negocio_id, path, filename);
            }

            // Actualizamos la custodia
            await this.repository.actualizarCustodia(custodia_id, negocio_id, {
                fecha_salida: new Date(),
                firma_salida: firma_url
            });

            // Revisar si existe alguna reparación activa (sin fecha de salida)
            let hasActiveReparacion = false;
            if (servicio.servicioReparacion && servicio.servicioReparacion.length > 0) {
                hasActiveReparacion = servicio.servicioReparacion.some(r => !r.fecha_salida);
            }

            // Cambiar estado del servicio dependiendo de las reparaciones
            const nuevoEstado = hasActiveReparacion ? ESTADO_SERVICIO.EN_REPARACION : ESTADO_SERVICIO.EN_SERVICIO;
            const svDetalle = await this.repository.cambiarEstado(servicio_id, negocio_id, nuevoEstado);

            return { servicio: svDetalle, estado: nuevoEstado };
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error al terminar custodia', 'DATABASE_ERROR', 500);
        }
    }
}
