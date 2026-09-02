import type { SucursalObtenidoDetalle, SucursalSimple } from "../../domain/sucursal.entity.js";

type PrismaSucursalConNegocio = any;

export class SucursalMapper {
    static mapDetalle(sucursal: PrismaSucursalConNegocio): SucursalObtenidoDetalle {
        return {
            id: sucursal.id,
            nombre: sucursal.nombre,
            es_principal: sucursal.es_principal ?? false,
            direccion: sucursal.direccion,
            codigo_establecimiento: sucursal.codigo_establecimiento,
            codigo_postal: sucursal.codigo_postal,
            division_nivel2_id: sucursal.division_nivel2_id,
            division_nivel_2: sucursal.division_nivel_2 ? {
                id: sucursal.division_nivel_2.id,
                nombre: sucursal.division_nivel_2.nombre,
                division_nivel_1: {
                    id: sucursal.division_nivel_2.division_nivel_1.id,
                    nombre: sucursal.division_nivel_2.division_nivel_1.nombre,
                    pais_id: sucursal.division_nivel_2.division_nivel_1.pais_id
                }
            } : null
        };
    }

    static mapSimple(sucursal: PrismaSucursalConNegocio): SucursalSimple {
        return {
            id: sucursal.id,
            nombre: sucursal.nombre,
            es_principal: sucursal.es_principal ?? false,
            direccion: sucursal.direccion,
            codigo_establecimiento: sucursal.codigo_establecimiento,
            codigo_postal: sucursal.codigo_postal,
            division_nivel2_id: sucursal.division_nivel2_id,
        };
    }
}
