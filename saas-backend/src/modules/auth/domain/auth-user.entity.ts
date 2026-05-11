export interface UsuarioAutentificacion {
    id: string,
    nombre: string,
    apellido: string | null,
    email: string | null,
    password_hash: string | null,
    telefono: string,
    activo: boolean | null,
    negocio_id: string,
    sucursal_id: string | null,
    permisos: string[],
    roles: string[]
}   