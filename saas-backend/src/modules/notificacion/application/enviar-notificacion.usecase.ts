import type { INotificacionService } from '../domain/notificacion.repository.js';
import type { AuthRepository } from '../../auth/domain/auth.repository.js';

export class EnviarNotificacionUseCase {
    constructor(
        private INotificacionService: INotificacionService,
        private authRepository: AuthRepository
    ) { }

    async execute(usuarioId: string, titulo: string, cuerpo: string): Promise<void> {
        try {
            const session = await this.authRepository.buscarSesionPorUsuarioId(usuarioId);

            if (!session || !session.fcm_token) {
                console.log(`El usuario ${usuarioId} no tiene un dispositivo o token registrado.`);
                return;
            }
            
            await this.INotificacionService.enviarPush({
                token: session.fcm_token,
                titulo,
                cuerpo,
            });
        } catch (error) {
            throw error;
        }   
    }
}