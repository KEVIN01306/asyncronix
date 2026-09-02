import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { ServicioRepository } from "../domain/servicio.repository.js";
import { ESTADO_SERVICIO } from "../domain/servicio.constants.js";
import type { EnviarNotificacionUseCase } from "../../notificacion/application/enviar-notificacion.usecase.js";

export class MandarCustodiaUseCase {
    constructor(private readonly repository: ServicioRepository, private readonly enviarNotificacionUseCase?: EnviarNotificacionUseCase) {}

    async execute(servicio_id: string, negocio_id: string) {
        try {
            const servicio = await this.repository.obtenerEstado(servicio_id, negocio_id);
            if (!servicio) throw new AppError('Servicio no encontrado', 'NOT_FOUND', 404);

            if (![ESTADO_SERVICIO.EN_DIAGNOSTICO, ESTADO_SERVICIO.ESPERA_REPUESTOS, ESTADO_SERVICIO.EN_SERVICIO, ESTADO_SERVICIO.EN_REPARACION].includes(servicio.estado as any)) {
                throw new AppError('El servicio no se encuentra en un estado válido para mandar a custodia', 'BAD_REQUEST', 400);
            }

            const custodia = await this.repository.crearCustodia(servicio_id, negocio_id);
            const svDetalle = await this.repository.cambiarEstado(servicio_id, negocio_id, ESTADO_SERVICIO.EN_CUSTODIA);

            if (this.enviarNotificacionUseCase && svDetalle.recepcionista_id) {
                const modelo = svDetalle.vehiculo?.modelo?.modelo ?? svDetalle.vehiculo?.modelo_nombre ?? 'N/A';
                await this.enviarNotificacionUseCase.execute(
                    svDetalle.recepcionista_id,
                    'Servicio en Custodia',
                    `El servicio ${svDetalle.tipo_servicio?.nombre} con el modelo de la moto ${modelo} ha pasado a estado de Custodia`
                ).catch(err => console.error('Error enviando notificación', err));
            }

            return { custodia, servicio: svDetalle };
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error al mandar a custodia', 'DATABASE_ERROR', 500);
        }
    }
}
