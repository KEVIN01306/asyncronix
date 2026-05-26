

export interface Session {
    id: string;
    token: string;
    usuario_id: string;
    fcm_token: string | null;
    fecha_expiracion: Date;
    fecha_creacion: Date;
}