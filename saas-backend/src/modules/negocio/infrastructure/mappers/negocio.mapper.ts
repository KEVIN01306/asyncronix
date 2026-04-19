import type { negocios } from "@prisma/client";
import type { NegocioObtenidoDetalle, NegocioSimple } from "../../domain/negocio.entity.js";

export class NegocioMapper {
    static mapDetalle(negocio: negocios): NegocioObtenidoDetalle {
        return {
            id: negocio.id,
            nombre_comercial: negocio.nombre_comercial,
            wa_id: negocio.wa_id,
            nit_rut: negocio.nit_rut,
            logo_url: negocio.logo_url,
            slogan: negocio.slogan,
            datos_facturacion_json: negocio.datos_facturacion_json,
            fecha_registro: negocio.fecha_registro as Date
        };
    }

    static mapSimple(negocio: negocios): NegocioSimple {
        return {
            id: negocio.id,
            nombre_comercial: negocio.nombre_comercial,
            logo_url: negocio.logo_url
        };
    }
}
