import type { UsuarioAutentificacion } from "modules/auth/domain/auth-user.entity.js";



export class AuthMapper {
    static mapUsuarioAutentificacion(usuario: any): UsuarioAutentificacion {

        return {
            id: usuario.id,
            nombre: usuario.nombre,
            password_hash: usuario.password_hash,
            telefono: usuario.telefono,
            verificado: usuario.verificado,
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
                logo_url: usuario.negocio.logo_url,
                pais: usuario.negocio.pais ? {
                    id: usuario.negocio.pais.id,
                    codigo_iso: usuario.negocio.pais.codigo_iso,
                    nombre: usuario.negocio.pais.nombre,
                    codigo_tel: usuario.negocio.pais.codigo_tel,
                    moneda_id: usuario.negocio.pais.moneda_id,
                    locale: usuario.negocio.pais.locale ?? null,
                    activo: usuario.negocio.pais.activo,
                    created_at: usuario.negocio.pais.created_at,
                    updated_at: usuario.negocio.pais.updated_at,
                } : null,
                moneda: usuario.negocio.moneda ? {
                    id: usuario.negocio.moneda.id,
                    codigo: usuario.negocio.moneda.codigo,
                    nombre: usuario.negocio.moneda.nombre,
                    simbolo: usuario.negocio.moneda.simbolo,
                    activo: usuario.negocio.moneda.activo,
                    created_at: usuario.negocio.moneda.created_at,
                    updated_at: usuario.negocio.moneda.updated_at,
                } : null,
            } : null
        };
    }
}