import { PrismaClient } from '@prisma/client';
import type { NotificacionPayload, NotificacionToken } from '../domain/notificacion.entity.js';
import type { INotificacionRepository } from '../domain/notificacion.repository.js';
import { DatabaseError } from '../../../shared/database/errors/DatabaseError.js';

export class PrismaNotificacionRepository implements INotificacionRepository {
    constructor(private prisma: PrismaClient) { }

    async guardarTokenFCM(usuarioId: string, token: string): Promise<NotificacionToken> {
        try {
            const sesion = await this.prisma.session.findUnique({
                where: { usuario_id: usuarioId },
            });

            if (!sesion) {
                throw new DatabaseError('Sesión del usuario no encontrada');
            }

            const sesionActualizada = await this.prisma.session.update({
                where: { usuario_id: usuarioId },
                data: {
                    fcm_token: token,
                },
            });

            return this.mapearNotificacionToken(sesionActualizada);
        } catch (error) {
            throw new DatabaseError(
                `Error al guardar token FCM: ${error instanceof Error ? error.message : 'Error desconocido'}`,
            );
        }
    }

    async obtenerTokenPorUsuario(usuarioId: string): Promise<NotificacionToken | null> {
        try {
            const sesion = await this.prisma.session.findUnique({
                where: { usuario_id: usuarioId },
            });

            return sesion ? this.mapearNotificacionToken(sesion) : null;
        } catch (error) {
            throw new DatabaseError(
                `Error al obtener token del usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`,
            );
        }
    }



    async eliminarToken(usuarioId: string): Promise<boolean> {
        try {
            await this.prisma.session.update({
                where: { usuario_id: usuarioId },
                data: { fcm_token: null },
            });

            return true;
        } catch (error) {
            throw new DatabaseError(
                `Error al eliminar token: ${error instanceof Error ? error.message : 'Error desconocido'}`,
            );
        }
    }


    async enviarPush(payload: NotificacionPayload): Promise<void> {}



    private mapearNotificacionToken(sesion: any): NotificacionToken {
        return {
            id: sesion.id,
            usuario_id: sesion.usuario_id,
            token: sesion.fcm_token || '',
            fecha_expiracion: sesion.fecha_expiracion,
            fecha_creacion: sesion.fecha_creacion,
        };
    }
}
