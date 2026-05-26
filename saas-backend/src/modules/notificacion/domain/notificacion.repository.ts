import type { NotificacionPayload, NotificacionToken } from './notificacion.entity.js';

export interface INotificacionRepository {
    guardarTokenFCM(usuarioId: string, token: string): Promise<NotificacionToken>;
    
    obtenerTokenPorUsuario(usuarioId: string): Promise<NotificacionToken | null>;
    
    eliminarToken(usuarioId: string): Promise<boolean>;
}

export interface INotificacionService {
    enviarPush(payload: NotificacionPayload): Promise<void>;
}