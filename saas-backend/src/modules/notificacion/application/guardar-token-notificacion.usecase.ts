import type { NotificacionToken } from '../domain/notificacion.entity.js';
import type { INotificacionRepository } from '../domain/notificacion.repository.js';
import AppError from '../../../shared/errors/AppError.js';

export class GuardarTokenNotificacionUseCase {
    constructor(private notificacionRepository: INotificacionRepository) { }

    async execute(usuarioId: string, token: string): Promise<NotificacionToken> {
        if (!usuarioId || !token) {
            throw new AppError('Usuario ID y Token son requeridos', "DATA_NOT_FOUND", 400);
        }

        if (token.trim().length === 0) {
            throw new AppError('El token no puede estar vacío', "DATA_INVALID", 400);
        }

        const notificacionToken = await this.notificacionRepository.guardarTokenFCM(usuarioId, token);

        return notificacionToken;
    }
}
