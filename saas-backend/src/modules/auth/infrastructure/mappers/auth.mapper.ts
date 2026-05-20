import type { UsuarioAutentificacion } from "modules/auth/domain/auth-user.entity.js";



export class AuthMapper {
    static mapUsuarioAutentificacion(usuario: any): UsuarioAutentificacion {

        return {
            id: usuario.id,
            nombre: usuario.nombre,
            password_hash: usuario.password_hash,
            telefono: usuario.telefono,
            activo: usuario.activo,
            negocio_id: usuario.negocio_id,
            sucursal_id: usuario.sucursal_id,
            roles: usuario.roles?.map((rol: any) => rol.nombre) || [],
            permisos: usuario.roles?.flatMap((rol: any) => rol.permisos?.map((permiso: any) => permiso.codigo) || []) || [],
            email: usuario.email,
            apellido: usuario.apellido,
            avatar_url: usuario.avatar_url,
            negocio: usuario.negocio ? {
                id: usuario.negocio.id,
                nombre_comercial: usuario.negocio.nombre_comercial,
                logo_url: usuario.negocio.logo_url
            } : null
        };
    }
}