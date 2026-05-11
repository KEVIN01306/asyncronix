
import type { UsuarioObtenidoDetalle, UsuarioSimple } from "../../domain/usuario.entity.js";


export class UsuarioMapper {
    static mapDetalle(usuario: any): UsuarioObtenidoDetalle {
        return {
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            telefono: usuario.telefono,
            roles: usuario.roles?.map((rol: any) => rol.nombre) || [],
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
            email: usuario.email,
            telefono: usuario.telefono,
            roles: usuario.roles?.map((rol: any) => rol.nombre) || [],

            sucursal: usuario.sucursal ? {
                id: usuario.sucursal.id,
                nombre: usuario.sucursal.nombre,
            } : null
        }
    }
}