import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { ServicioRepository } from "../domain/servicio.repository.js";
import { ESTADO_SERVICIO } from "../domain/servicio.constants.js";
import type { EnviarNotificacionUseCase } from "../../notificacion/application/enviar-notificacion.usecase.js";
import type { CrearMediaUseCase } from "../../media/application/crear-media.usecase.js";
import type { FileDTO } from "@shared/domain/providers/storage.provider.js";

export class MandarReparacionUseCase {
    constructor(
        private readonly repository: ServicioRepository, 
        private readonly enviarNotificacionUseCase?: EnviarNotificacionUseCase,
        private readonly crearMediaUseCase?: CrearMediaUseCase
    ) {}

    async execute(servicio_id: string, file: FileDTO, negocio_id: string) {
        try {
            const servicio = await this.repository.obtenerEstado(servicio_id, negocio_id);
            if (!servicio) throw new AppError('Servicio no encontrado', 'NOT_FOUND', 404);

            if (![ESTADO_SERVICIO.EN_DIAGNOSTICO, ESTADO_SERVICIO.ESPERA_REPUESTOS, ESTADO_SERVICIO.EN_SERVICIO, ESTADO_SERVICIO.EN_CUSTODIA].includes(servicio.estado as any)) {
                throw new AppError('El servicio no se encuentra en un estado válido para mandar a reparación', 'BAD_REQUEST', 400);
            }

            let firma_url = '';
            if (this.crearMediaUseCase) {
                const path = `tenant_${negocio_id}/services/vehiculo/srv_${servicio_id}/reparaciones`;
                const filename = `firma_entrada_${Date.now()}.png`;
                firma_url = await this.crearMediaUseCase.execute(file, negocio_id, path, filename);
            }

            // Close active custody if coming from EN_CUSTODIA
            if (servicio.estado === ESTADO_SERVICIO.EN_CUSTODIA) {
                const fullService = await this.repository.obtener(servicio_id, negocio_id);
                if (fullService && fullService.servicioCustodias) {
                    const activeCustody = fullService.servicioCustodias.find(c => !c.fecha_salida);
                    if (activeCustody) {
                        await this.repository.actualizarCustodia(activeCustody.id, negocio_id, {
                            fecha_salida: new Date(),
                            firma_salida: firma_url // Using the same signature as both exit and entry
                        });
                    }
                }
            }

            const reparacion = await this.repository.crearReparacion(servicio_id, firma_url, negocio_id);
            const svDetalle = await this.repository.cambiarEstado(servicio_id, negocio_id, ESTADO_SERVICIO.EN_REPARACION);

            if (this.enviarNotificacionUseCase && svDetalle.recepcionista_id) {
                const modelo = svDetalle.vehiculo?.modelo?.modelo ?? svDetalle.vehiculo?.modelo_nombre ?? 'N/A';
                await this.enviarNotificacionUseCase.execute(
                    svDetalle.recepcionista_id,
                    'Servicio en Reparación',
                    `El servicio ${svDetalle.tipo_servicio?.nombre} con el modelo de la moto ${modelo} ha pasado a estado de Reparación`
                ).catch(err => console.error('Error enviando notificación', err));
            }

            return { reparacion, servicio: svDetalle };
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error al mandar a reparación', 'DATABASE_ERROR', 500);
        }
    }
}
