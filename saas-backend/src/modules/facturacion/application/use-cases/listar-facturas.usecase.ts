import type { FacturaRepository } from "../../domain/interfaces/factura.repository.js";
import { resolverRangoFechas } from "../utils/date-range.util.js";
import AppError from "../../../../shared/errors/AppError.js";

export interface ListarFacturasInputDTO {
    negocio_id: string;
    periodo?: string | null;
    fecha_inicio?: string | null;
    fecha_fin?: string | null;
    page?: number;
    limit?: number;
    q?: string;
}

export class ListarFacturasUseCase {
    constructor(private readonly facturaRepository: FacturaRepository) {}

    async execute(input: ListarFacturasInputDTO) {
        if (!input.negocio_id) {
            throw new AppError("Negocio no especificado", "NEGOCIO_REQUERIDO", 400);
        }

        const { inicio, fin } = resolverRangoFechas(
            input.periodo,
            input.fecha_inicio,
            input.fecha_fin
        );

        const page = Math.max(1, Number(input.page) || 1);
        const limit = Math.min(10000, Math.max(1, Number(input.limit) || 10));

        const resultado = await this.facturaRepository.listarEmitidas(input.negocio_id, {
            fecha_inicio: inicio,
            fecha_fin: fin,
            page,
            limit,
            q: input.q
        });

        // Mapear a respuesta limpia para el frontend
        const items = resultado.data.map(f => ({
            id: f.id,
            dte_uuid: f.dte_uuid,
            serie: f.serie,
            numero_factura: f.numero_factura,
            tipo_dte: f.tipo_dte,
            fecha_emision: f.fecha_emision,
            fecha_certificacion: f.fecha_certificacion,
            total: Number(f.total),
            total_impuestos: Number(f.total_impuestos),
            subtotal_sin_iva: Number(f.subtotal_sin_iva),
            porcentaje_impuesto: Number(f.porcentaje_impuesto),
            emisor_afiliacion_iva: f.emisor_afiliacion_iva,
            receptor_nit: f.receptor_nit,
            receptor_nombre: f.receptor_nombre,
            estado: f.estado,
            tiene_xml: Boolean(f.dte_sat_xml),
            tiene_pdf: Boolean(f.dle_sat_pdf),
        }));

        return {
            data: items,
            pagination: {
                total: resultado.total,
                page: resultado.page,
                limit: resultado.limit,
                totalPages: resultado.totalPages
            },
            rango: {
                fecha_inicio: inicio.toISOString(),
                fecha_fin: fin.toISOString(),
                periodo: input.periodo || 'este_mes'
            }
        };
    }
}
