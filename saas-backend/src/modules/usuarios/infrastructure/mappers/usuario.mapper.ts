import { usuarios_rol, type usuarios } from "@prisma/client";
import { RolUsuario } from "../../domain/rol.enum.js";
import type { UsuarioObtenidoDetalle, UsuarioSimple } from "../../domain/usuario.entity.js";


export class UsuarioMapper {

    static mapRolVista(rol: usuarios_rol): RolUsuario {
        const map: Record<usuarios_rol, RolUsuario> = {
            ADMIN: RolUsuario.ADMIN,
            VENDEDOR: RolUsuario.VENDEDOR
        }

        return map[rol]
    }

    static mapRolBaseDatos(rol: RolUsuario): usuarios_rol {
        const map: Record<RolUsuario, usuarios_rol> = {
            ADMIN: usuarios_rol.ADMIN,
            VENDEDOR: usuarios_rol.VENDEDOR
        }

        return map[rol]
    }

    static mapDetalle(usuario: any): UsuarioObtenidoDetalle {
        return {
            id: usuario.id,
            nombre: usuario.nombre,
            telefono: usuario.telefono,
            rol: this.mapRolVista(usuario.rol),
            verificado: usuario.verificado,
            sucursal: usuario.sucursales ? {
                id: usuario.sucursales.id,
                nombre: usuario.sucursales.nombre,
            } : null
        }
    }

    static mapSimple(usuario: any): UsuarioSimple {
        return {
            id: usuario.id,
            nombre: usuario.nombre,
            telefono: usuario.telefono,
            rol: this.mapRolVista(usuario.rol),
            sucursal: usuario.sucursales ? {
                id: usuario.sucursales.id,
                nombre: usuario.sucursales.nombre,
            } : null
        }
    }
}