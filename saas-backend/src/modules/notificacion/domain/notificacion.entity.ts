export interface NotificacionToken {
    id: string;
    usuario_id: string;
    token: string;
    fecha_expiracion: Date;
    fecha_creacion: Date;
}


export interface NotificacionPayload {
    token: string;
    titulo: string;
    cuerpo: string;
}