
import type { UsuarioObtenidoDetalle, UsuarioSimple } from "../../domain/usuario.entity.js";


export class UsuarioMapper {
    static mapDetalle(usuario: any): UsuarioObtenidoDetalle {
        return {
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            avatar_url: usuario.avatar_url,
            email: usuario.email,
            telefono: usuario.telefono,
            pin_caja: usuario.pin_caja,
            roles: usuario.roles?.map((rol: any) => {return { id: rol.id, nombre: rol.nombre }}) || [],
            verificado: usuario.verificado,
            sucursal: usuario.sucursal ? {
                id: usuario.sucursal.id,
                nombre: usuario.sucursal.nombre,
            } : null
        }
    }

    static mapSimple(usuario: any): UsuarioSimple {
        return {
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            avatar_url: usuario.avatar_url,
            email: usuario.email,
            telefono: usuario.telefono,
            pin_caja: usuario.pin_caja,
            roles: usuario.roles?.map((rol: any) => { return { id: rol.id, nombre: rol.nombre } }) || [],
            sucursal: usuario.sucursal ? {
                id: usuario.sucursal.id,
                nombre: usuario.sucursal.nombre,
            } : null
        }
    }
}