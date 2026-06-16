import type { ServicioRepository } from "../domain/servicio.repository.js";
import type { EnviarNotificacionUseCase } from "../../notificacion/application/enviar-notificacion.usecase.js";

export class AsociarMecanicoServicioUseCase {
    constructor(
        private readonly repository: ServicioRepository,
        private readonly enviarNotificacionUseCase: EnviarNotificacionUseCase
    ) { }

    async execute(servicio_id: string, mecanico_id: string, negocio_id: string) {
        try {
            const servicio = await this.repository.asociarMecanico(servicio_id, mecanico_id, negocio_id);

            await this.enviarNotificacionUseCase.execute(
                mecanico_id,
                'tienes un nuevo servicio',
                'Se te asigno un nuevo servicio, aun esta En recepcion, preparate !'
            );

            return servicio;
        } catch (error) {
            throw error;
        }
    }
}

export default AsociarMecanicoServicioUseCase;
