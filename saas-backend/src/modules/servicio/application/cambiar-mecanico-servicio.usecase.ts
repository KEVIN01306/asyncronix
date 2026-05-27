import type { ServicioRepository } from "../domain/servicio.repository.js";
import type { EnviarNotificacionUseCase } from "../../notificacion/application/enviar-notificacion.usecase.js";

export class CambiarMecanicoServicioUseCase {
    constructor(
        private readonly repository: ServicioRepository,
        private readonly enviarNotificacionUseCase: EnviarNotificacionUseCase
    ) { }

    async execute(servicio_id: string, mecanicoAnteriorId: string, mecanicoNuevoId: string, negocio_id: string) {
        try {
            const servicio = await this.repository.cambiarMecanico(servicio_id, mecanicoAnteriorId, mecanicoNuevoId, negocio_id);

            if (mecanicoNuevoId) {
                await this.enviarNotificacionUseCase.execute(
                    mecanicoNuevoId,
                    'tienes un nuevo servicio',
                    'Se te asignó un nuevo servicio. Revisa tu agenda y prepárate.'
                );
            }

            if (mecanicoAnteriorId && mecanicoAnteriorId !== mecanicoNuevoId) {
                await this.enviarNotificacionUseCase.execute(
                    mecanicoAnteriorId,
                    'servicio revocado',
                    'El servicio que tenías asignado fue revocado.'
                );
            }

            return servicio;
        } catch (error) {
            throw error;
        }
    }
}

export default CambiarMecanicoServicioUseCase;
