import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { ServicioRepository } from "../domain/servicio.repository.js";
import type { ServicioDetalle } from "../domain/servicio.entity.js";
import { ESTADO_SERVICIO } from "../domain/servicio.constants.js";
import type { EnviarNotificacionUseCase } from "../../notificacion/application/enviar-notificacion.usecase.js";

export class CambiarEstadoServicioUseCase {
    constructor(private readonly repository: ServicioRepository, private readonly enviarNotificacionUseCase?: EnviarNotificacionUseCase) { }

    async execute(id: string, negocio_id: string, estado: string): Promise<ServicioDetalle> {
        try {
            const servicio = await this.repository.cambiarEstado(id, negocio_id, estado);

            try {
                let modelo = servicio.vehiculo?.modelo?.modelo ?? servicio.vehiculo?.modelo_nombre ?? 'N/A';
                let titulo = 'Servicio cambio de estado';
                let cuerpo = `El servicio ${servicio.tipo_servicio?.nombre} con el modelo de la moto ${modelo} ha cambiado su estado a ${estado}`;

                if (servicio.mecanico && servicio.mecanico.id && this.enviarNotificacionUseCase){
                    if (estado === ESTADO_SERVICIO.LISTO_ENTREGA ) {
                        titulo = 'Servicio aprobado';
                        cuerpo = `El servicio ${servicio.tipo_servicio?.nombre} con el modelo de la moto ${modelo} ha sido aprobado`;
                    }
                await this.enviarNotificacionUseCase.execute(servicio.mecanico.id, titulo, cuerpo);
                }
            } catch (err) {
                console.error('Error enviando notificación tras cambiar estado:', err);
            }

            return servicio;
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
