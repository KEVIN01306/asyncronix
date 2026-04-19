

export interface Session {
    id: string;
    token: string;
    usuario_id: string;
    fecha_expiracion: Date;
    fecha_creacion: Date;
}