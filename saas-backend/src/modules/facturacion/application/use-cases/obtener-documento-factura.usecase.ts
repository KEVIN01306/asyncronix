import type { FacturaRepository } from "../../domain/interfaces/factura.repository.js";
import AppError from "../../../../shared/errors/AppError.js";

export class ObtenerDocumentoFacturaUseCase {
    constructor(private readonly facturaRepository: FacturaRepository) {}

    async execute(facturaId: string, tipo: 'xml' | 'pdf', negocio_id: string) {
        if (!facturaId) {
            throw new AppError("ID de factura requerido", "ID_REQUERIDO", 400);
        }

        const factura = await this.facturaRepository.obtenerPorIdYNegocio(facturaId, negocio_id);
        if (!factura) {
            throw new AppError("Factura no encontrada", "FACTURA_NO_ENCONTRADA", 404);
        }

        let url: string | null = null;
        if (tipo === 'xml') {
            url = factura.dte_sat_xml ?? null;
        } else if (tipo === 'pdf') {
            url = factura.dle_sat_pdf ?? null;
        } else {
            throw new AppError("Tipo de documento no válido. Use 'xml' o 'pdf'", "TIPO_DOCUMENTO_INVALIDO", 400);
        }

        if (!url) {
            throw new AppError(
                `El documento ${tipo.toUpperCase()} no está disponible para esta factura`,
                "DOCUMENTO_NO_DISPONIBLE",
                404
            );
        }

        return {
            url,
            tipo,
            numero_factura: factura.numero_factura,
            dte_uuid: factura.dte_uuid
        };
    }
}
