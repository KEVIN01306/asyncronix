import type { FacturaRepository } from "../../domain/interfaces/factura.repository.js";
import { resolverRangoFechas } from "../utils/date-range.util.js";
import AppError from "../../../../shared/errors/AppError.js";

export interface ObtenerResumenFiscalInputDTO {
    negocio_id: string;
    periodo?: string | null;
    fecha_inicio?: string | null;
    fecha_fin?: string | null;
}

export class ObtenerResumenFiscalUseCase {
    constructor(private readonly facturaRepository: FacturaRepository) {}

    async execute(input: ObtenerResumenFiscalInputDTO) {
        if (!input.negocio_id) {
            throw new AppError("Negocio no especificado", "NEGOCIO_REQUERIDO", 400);
        }

        const { inicio, fin } = resolverRangoFechas(
            input.periodo,
            input.fecha_inicio,
            input.fecha_fin
        );

        const resumen = await this.facturaRepository.obtenerResumenFiscal(
            input.negocio_id,
            inicio,
            fin
        );

        return {
            ...resumen,
            periodo: input.periodo || 'este_mes',
            rango: {
                fecha_inicio: inicio.toISOString(),
                fecha_fin: fin.toISOString()
            }
        };
    }
}
