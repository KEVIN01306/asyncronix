import type { IDigifactProvider } from "@shared/domain/providers/digifact.provider.interface.js";
import type { FacturaRepository } from "../../domain/interfaces/factura.repository.js";
import AppError from "@shared/errors/AppError.js";

export class ObtenerTokenDigifactUseCase {
    constructor(
        private readonly facturaRepository: FacturaRepository,
        private readonly digifactProvider: IDigifactProvider
    ) { }

    async execute(negocio_id: string): Promise<string> {
        const config = await this.facturaRepository.obtenerConfiguracion(negocio_id);

        if (!config) {
            throw new AppError("El negocio no tiene configuración de facturación", "CONFIG_FACTURACION_NO_ENCONTRADA", 404);
        }

        // 1. Revisar si ya existe un token válido
        if (config.token_temporal && config.token_expira_at) {
            const ahora = new Date();
            // Dejar un margen de seguridad de 5 minutos
            const expiraSeguro = new Date(config.token_expira_at.getTime() - 5 * 60000);

            if (ahora < expiraSeguro) {
                return config.token_temporal;
            }
        }

        // 2. Solicitar un nuevo token si no hay o ya expiró
        if (!config.fel_username || !config.fel_password) {
            throw new AppError("Credenciales de Digifact incompletas en la configuración", "CREDENCIALES_DIGIFACT_INCOMPLETAS", 400);
        }

        let digifactUsername = config.fel_username;
        if (!digifactUsername.startsWith('GT.')) {
            const taxId = config.nit_emisor.padStart(12, '0');
            digifactUsername = `GT.${taxId}.${config.fel_username}`;
        }

        const authResponse = await this.digifactProvider.login({
            Username: digifactUsername,
            Password: config.fel_password,
            ambiente: config.fel_ambiente || 'TEST'
        });

        const token = authResponse.Token;
        const expiraEn = new Date(authResponse.expira_en); // formato "10/4/2026 5:29:55 PM" parseable por Date

        // 3. Guardar el nuevo token
        await this.facturaRepository.guardarTokenTemporal(negocio_id, token, expiraEn);

        return token;
    }
}
