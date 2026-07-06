export interface Perfil {
    id: string;
    nombre: string;
    apellido: string | null;
    email: string | null;
    telefono: string;
    avatar_url: string | null;
    verificado: boolean;
    negocio_id: string;
    pin_caja?: string | null;
    roles: string[];
}

export interface ActualizarPerfilForm {
    nombre: string;
    apellido: string | null;
    email: string | null;
    telefono: string;
}

export interface ActualizarPinCajaForm {
    pin_caja: string;
}

export interface ActualizarPinSucursalForm {
    pin_sucursal: string;
}

export interface CambiarPasswordForm {
    password: string;
    confirm_password: string;
}
