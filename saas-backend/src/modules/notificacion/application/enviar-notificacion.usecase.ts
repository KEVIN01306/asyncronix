import type { INotificacionService } from '../domain/notificacion.repository.js';
import type { AuthRepository } from '../../auth/domain/auth.repository.js';

export class EnviarNotificacionUseCase {
    constructor(
        private iNotificacionService: INotificacionService,
        private authRepository: AuthRepository
    ) { }

    async execute(usuarioId: string, titulo: string, cuerpo: string): Promise<void> {
        try {
            const session = await this.authRepository.buscarSesionPorUsuarioId(usuarioId);

            console.log(`Enviando notificación a usuario ${usuarioId} con token ${session?.fcm_token}`);
            if (!session || !session.fcm_token) {
                console.log(`El usuario ${usuarioId} no tiene un dispositivo o token registrado.`);
                return;
            }

            console.log(`Token FCM encontrado para usuario ${usuarioId}: ${session.fcm_token}`);

            await this.iNotificacionService.enviarPush({
                token: session.fcm_token,
                titulo,
                cuerpo,
            });
        } catch (error) {
            console.error(`Error al enviar notificación a usuario ${usuarioId}:`, error);
            throw error;
        }   
    }
}