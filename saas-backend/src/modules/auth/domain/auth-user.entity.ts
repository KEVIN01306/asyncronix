export interface UsuarioAutentificacion {
    id: string,
    nombre: string,
    apellido: string | null,
    email: string | null,
    avatar_url: string | null,
    password_hash: string | null,
    telefono: string,
    activo: boolean | null,
    negocio_id: string,
    sucursal_id: string | null,
    permisos: string[],
    roles: string[]
    negocio?: {
        id: string;
        nombre_comercial: string;
        logo_url: string | null;
    } | null;
}   