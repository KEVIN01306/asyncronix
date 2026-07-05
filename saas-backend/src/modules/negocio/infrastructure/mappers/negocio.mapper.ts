import type { Negocio, NegocioObtenidoDetalle, NegocioSimple } from "../../domain/negocio.entity.js";

export class NegocioMapper {
    static mapDetalle(negocio: any): NegocioObtenidoDetalle {
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
            fecha_registro: negocio.fecha_registro,
            created_at: negocio.created_at,
            updated_at: negocio.updated_at,
            pais_id: negocio.pais_id ?? null,
            moneda_id: negocio.moneda_id ?? null,
            instagram_id: negocio.instagram_id ?? null,
            facebook_id: negocio.facebook_id ?? null,
            pais: negocio.pais ? {
                id: negocio.pais.id,
                codigo_iso: negocio.pais.codigo_iso,
                nombre: negocio.pais.nombre,
                codigo_tel: negocio.pais.codigo_tel,
                moneda_id: negocio.pais.moneda_id,
                activo: negocio.pais.activo,
                created_at: negocio.pais.created_at,
                updated_at: negocio.pais.updated_at,
            } : null,
            moneda: negocio.moneda ? {
                id: negocio.moneda.id,
                codigo: negocio.moneda.codigo,
                nombre: negocio.moneda.nombre,
                simbolo: negocio.moneda.simbolo,
                activo: negocio.moneda.activo,
                created_at: negocio.moneda.created_at,
                updated_at: negocio.moneda.updated_at,
            } : null,
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
