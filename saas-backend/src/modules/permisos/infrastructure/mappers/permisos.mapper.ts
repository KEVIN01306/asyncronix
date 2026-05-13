import type { Modulo, Permiso } from "../../domain/permiso.entity.js";

export class PermisosMapper {
    static mapModulo(modulo: any): Modulo {
        return {
            id: modulo.id,
            nombre: modulo.nombre,
            descripcion: modulo.descripcion,
        }
    }

    static mapPermiso(permiso: any): Permiso {
        return {
            id: permiso.id,
            codigo: permiso.codigo,
            descripcion: permiso.descripcion,
            modulo_id: permiso.modulo_id,
        }
    }
}
