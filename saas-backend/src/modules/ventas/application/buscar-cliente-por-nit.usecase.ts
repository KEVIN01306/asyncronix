import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { ClienteObtenidoDetalle } from "../../cliente/domain/cliente.entity.js";
import type { ClienteRepository } from "../../cliente/domain/cliente.repository.js";
import { normalizarDpi } from "../../cliente/domain/utils/normalizar-dpi.js";

export class BuscarClientePorNitVentaUseCase {
    constructor(
        private readonly clienteRepository: ClienteRepository
    ) { }

    async execute(documento: string, negocio_id: string): Promise<ClienteObtenidoDetalle | null> {
        try {
            const cleanDoc = documento?.trim() || "";
            const dpi = normalizarDpi(cleanDoc);
            const nit = cleanDoc.toUpperCase();

            // Buscar globalmente para permitir reutilizar clientes de otros negocios
            if (dpi && dpi.length >= 10) {
                const clientePorDpi = await this.clienteRepository.buscarPorDpi(dpi);
                if (clientePorDpi) {
                    const yaAsociado = await this.clienteRepository.estaAsociadoANegocio(clientePorDpi.id, negocio_id);
                    if (!yaAsociado) {
                        await this.clienteRepository.asociarNegocio(clientePorDpi.id, negocio_id);
                    }
                    return clientePorDpi;
                }
            }

            if (nit && nit !== "CF" && nit !== "C/F") {
                const clientePorNit = await this.clienteRepository.buscarPorNit(nit);
                if (clientePorNit) {
                    const yaAsociado = await this.clienteRepository.estaAsociadoANegocio(clientePorNit.id, negocio_id);
                    if (!yaAsociado) {
                        await this.clienteRepository.asociarNegocio(clientePorNit.id, negocio_id);
                    }
                    return clientePorNit;
                }
            }

            return null;
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError("Error en base de datos al buscar cliente para venta", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
