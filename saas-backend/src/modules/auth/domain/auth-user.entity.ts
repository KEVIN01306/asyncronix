export interface UsuarioAutentificacion {
    id: string,
    nombre: string,
    password_hash: string | null,
    telefono: string,
    rol: string,
    activo: boolean | null,
    negocio_id: string,
    sucursal_id: string | null,
}
