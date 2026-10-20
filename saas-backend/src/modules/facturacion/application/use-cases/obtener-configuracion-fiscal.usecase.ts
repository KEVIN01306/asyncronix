import type { FacturaRepository } from "../../domain/interfaces/factura.repository.js";
import AppError from "../../../../shared/errors/AppError.js";

export class ObtenerConfiguracionFiscalUseCase {
    constructor(private readonly facturaRepository: FacturaRepository) {}

    async execute(negocio_id: string) {
        if (!negocio_id) {
            throw new AppError("Negocio requerido", "NEGOCIO_REQUERIDO", 400);
        }

        const config = await this.facturaRepository.obtenerConfiguracion(negocio_id);
        if (!config) {
            return null;
        }

        return {
            id: config.id,
            negocio_id: config.negocio_id,
            nit_emisor: config.nit_emisor,
            nombre_emisor: config.nombre_emisor,
            nombre_comercial: config.nombre_comercial,
            afiliacion_iva: config.afiliacion_iva,
            tipo_frase: config.tipo_frase,
            codigo_escenario: config.codigo_escenario,
            correo_emisor: config.correo_emisor,
            fel_username: config.fel_username,
            fel_ambiente: config.fel_ambiente,
            activo: config.activo,
            has_password: Boolean(config.fel_password)
        };
    }
}
