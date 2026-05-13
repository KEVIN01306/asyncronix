import type { RolObtenidoDetalle, RolSimple } from "../../domain/rol.entity.js";

export class RolMapper {
    static mapDetalle(rol: any): RolObtenidoDetalle {
        return {
            id: rol.id,
            nombre: rol.nombre,
            descripcion: rol.descripcion,
            permisos: rol.permisos?.map((permiso: any) => ({
                id: permiso.id,
                codigo: permiso.codigo
            })) || []
        }
    }

    static mapSimple(rol: any): RolSimple {
        return {
            id: rol.id,
            nombre: rol.nombre,
            descripcion: rol.descripcion,
            permisos: rol.permisos?.map((permiso: any) => ({
                id: permiso.id,
                codigo: permiso.codigo
            })) || []
        }
    }
}
