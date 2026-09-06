import AppError from "@shared/errors/AppError.js";
import type { FacturaRepository } from "../../domain/interfaces/factura.repository.js";
import type { IDigifactProvider } from "@shared/domain/providers/digifact.provider.interface.js";
import type { ObtenerTokenDigifactUseCase } from "./obtener-token-digifact.usecase.js";

export class ConsultarNitUseCase {
    constructor(
        private readonly facturaRepository: FacturaRepository,
        private readonly digifactProvider: IDigifactProvider,
        private readonly obtenerTokenDigifactUseCase: ObtenerTokenDigifactUseCase
    ) { }

    async execute(nitConsultar: string, negocio_id: string): Promise<{ nit: string, nombre: string }> {
        if (!nitConsultar || nitConsultar.trim() === '') {
            throw new AppError("El NIT a consultar es requerido", "NIT_REQUERIDO", 400);
        }

        const nitLimpio = nitConsultar.trim();

        // 1. Obtener la configuración FEL con el País del negocio
        const config = await this.facturaRepository.obtenerConfiguracionConPais(negocio_id);
        
        if (!config || !config.fel_username || !config.nit_emisor) {
            throw new AppError("No se encontró la configuración de facturación para realizar consultas", "CONFIG_FACTURACION_NO_ENCONTRADA", 404);
        }

        const codigoIsoPais = config.negocio?.pais?.codigo_iso;
        if (!codigoIsoPais) {
            throw new AppError("El negocio no tiene un país configurado o le falta el código ISO", "PAIS_NO_CONFIGURADO", 400);
        }

        // 2. Obtener el token de Digifact
        const token = await this.obtenerTokenDigifactUseCase.execute(negocio_id);

        // 3. Consultar Digifact
        const response = await this.digifactProvider.obtenerInformacionNit(token, {
            nitEmisor: config.nit_emisor,
            nitConsultar: nitLimpio,
            username: config.fel_username,
            ambiente: config.fel_ambiente || 'TEST',
            codigoIsoPais: codigoIsoPais
        });

        // 4. Procesar la respuesta
        if (!response.RESPONSE || response.RESPONSE.length === 0) {
            throw new AppError("Digifact no devolvió información para el NIT consultado", "NIT_NO_ENCONTRADO", 404);
        }

        const info = response.RESPONSE[0];

        if (!info || !info.NIT || !info.NOMBRE) {
            throw new AppError("Digifact devolvió información incompleta", "DIGIFACT_RESPUESTA_INVALIDA", 502);
        }

        return {
            nit: info.NIT,
            nombre: info.NOMBRE
        };
    }
}
