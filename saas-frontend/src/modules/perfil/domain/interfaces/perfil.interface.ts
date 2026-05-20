export interface Perfil {
    id: string;
    nombre: string;
    apellido: string | null;
    email: string | null;
    telefono: string;
    avatar_url: string | null;
    verificado: boolean;
    negocio_id: string;
    roles: string[];
}

export interface ActualizarPerfilForm {
    nombre: string;
    apellido: string | null;
    email: string | null;
    telefono: string;
}

export interface CambiarPasswordForm {
    password: string;
    confirm_password: string;
}
