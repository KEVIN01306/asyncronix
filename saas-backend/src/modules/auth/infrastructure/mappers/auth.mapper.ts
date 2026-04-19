import type { UsuarioAutentificacion } from "modules/auth/domain/auth-user.entity.js";



export class AuthMapper {
    static mapUsuarioAutentificacion(usuario: UsuarioAutentificacion): UsuarioAutentificacion {

        return {
            id: usuario.id,
            nombre: usuario.nombre,
            password_hash: usuario.password_hash,
            telefono: usuario.telefono,
            rol: usuario.rol,
            activo: usuario.activo,
            negocio_id: usuario.negocio_id,
            sucursal_id: usuario.sucursal_id,
        };
    }
}