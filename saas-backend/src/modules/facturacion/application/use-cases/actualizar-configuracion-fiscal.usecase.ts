import type { FacturaRepository } from "../../domain/interfaces/factura.repository.js";
import { obtenerConfiguracionRegimen } from "../../domain/constants/regimen-fiscal.constants.js";
import AppError from "../../../../shared/errors/AppError.js";

export interface ActualizarConfiguracionFiscalInputDTO {
    nit_emisor: string;
    nombre_emisor: string;
    nombre_comercial: string;
    afiliacion_iva: string;
    tipo_frase: number;
    codigo_escenario: number;
    correo_emisor: string;
    fel_username: string;
    fel_password?: string;
    fel_ambiente: string;
}

export class ActualizarConfiguracionFiscalUseCase {
    constructor(private readonly facturaRepository: FacturaRepository) {}

    async execute(negocio_id: string, data: ActualizarConfiguracionFiscalInputDTO) {
        if (!negocio_id) {
            throw new AppError("Negocio requerido", "NEGOCIO_REQUERIDO", 400);
        }

        // Validar régimen fiscal
        obtenerConfiguracionRegimen(data.afiliacion_iva);

        const configExistente = await this.facturaRepository.obtenerConfiguracion(negocio_id);

        const updateData: any = {
            nit_emisor: data.nit_emisor.trim(),
            nombre_emisor: data.nombre_emisor.trim(),
            nombre_comercial: data.nombre_comercial.trim(),
            afiliacion_iva: data.afiliacion_iva.trim().toUpperCase(),
            tipo_frase: Number(data.tipo_frase),
            codigo_escenario: Number(data.codigo_escenario),
            correo_emisor: data.correo_emisor.trim(),
            fel_username: data.fel_username.trim(),
            fel_ambiente: data.fel_ambiente.trim().toUpperCase(),
            token_temporal: null,
            token_expira_at: null
        };

        if (data.fel_password && data.fel_password.trim() !== '') {
            updateData.fel_password = data.fel_password.trim();
        } else if (!configExistente) {
            throw new AppError("La contraseña de FEL es requerida para la configuración inicial", "PASSWORD_REQUERIDO", 400);
        }

        const actualizada = await this.facturaRepository.actualizarConfiguracion(negocio_id, updateData);

        return {
            id: actualizada.id,
            negocio_id: actualizada.negocio_id,
            nit_emisor: actualizada.nit_emisor,
            nombre_emisor: actualizada.nombre_emisor,
            nombre_comercial: actualizada.nombre_comercial,
            afiliacion_iva: actualizada.afiliacion_iva,
            tipo_frase: actualizada.tipo_frase,
            codigo_escenario: actualizada.codigo_escenario,
            correo_emisor: actualizada.correo_emisor,
            fel_username: actualizada.fel_username,
            fel_ambiente: actualizada.fel_ambiente,
            activo: actualizada.activo,
            has_password: Boolean(actualizada.fel_password)
        };
    }
}
