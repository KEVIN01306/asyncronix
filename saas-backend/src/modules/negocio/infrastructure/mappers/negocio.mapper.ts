import type { Negocio, NegocioObtenidoDetalle, NegocioSimple } from "../../domain/negocio.entity.js";

export class NegocioMapper {
    static mapDetalle(negocio: Negocio): NegocioObtenidoDetalle {
        return {
            id: negocio.id,
            nombre_comercial: negocio.nombre_comercial,
            nombre: negocio.nombre,
            slug: negocio.slug,
            wa_id: negocio.wa_id,
            nit_rut: negocio.nit_rut,
            logo_url: negocio.logo_url,
            slogan: negocio.slogan,
            activo: negocio.activo,
            datos_facturacion_json: negocio.datos_facturacion_json,
            fecha_registro: negocio.fecha_registro as Date
        };
    }

    static mapSimple(negocio: Negocio): NegocioSimple {
        return {
            id: negocio.id,
            nombre_comercial: negocio.nombre_comercial,
            logo_url: negocio.logo_url,
        };
    }
}
