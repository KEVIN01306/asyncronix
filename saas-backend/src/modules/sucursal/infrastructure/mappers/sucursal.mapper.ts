import type { sucursales, negocios } from "@prisma/client";
import type { SucursalObtenidoDetalle, SucursalSimple } from "../../domain/sucursal.entity.js";

type PrismaSucursalConNegocio = sucursales & {
    negocios: negocios;
};

export class SucursalMapper {
    static mapDetalle(sucursal: PrismaSucursalConNegocio): SucursalObtenidoDetalle {
        return {
            id: sucursal.id,
            nombre: sucursal.nombre,
            es_principal: sucursal.es_principal,
            direccion: sucursal.direccion,
        };
    }

    static mapSimple(sucursal: PrismaSucursalConNegocio): SucursalSimple {
        return {
            id: sucursal.id,
            nombre: sucursal.nombre,
            es_principal: sucursal.es_principal,
            direccion: sucursal.direccion,
        };
    }
}
