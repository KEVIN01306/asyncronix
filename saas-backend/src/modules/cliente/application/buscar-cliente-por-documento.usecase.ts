import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { ClienteObtenidoDetalle } from "../domain/cliente.entity.js";
import type { ClienteRepository } from "../domain/cliente.repository.js";
import { normalizarDpi } from "../domain/utils/normalizar-dpi.js";

export class BuscarClientePorDocumentoUseCase {
    constructor(
        private readonly clienteRepository: ClienteRepository
    ) { }

    async execute(
        data: { nit?: string | null; dpi?: string | null },
        negocio_id: string,
        soloNegocio: boolean = false
    ): Promise<ClienteObtenidoDetalle | null> {
        try {
            const dpi = normalizarDpi(data.dpi);
            const nit = data.nit?.trim() ? data.nit.trim().toUpperCase() : null;

            if (!dpi && !nit) {
                return null;
            }

            if (soloNegocio) {
                return await this.clienteRepository.buscarPorDocumentoYNegocio({ nit, dpi }, negocio_id);
            }

            // Búsqueda global (primero por DPI si existe, luego por NIT)
            return await this.clienteRepository.buscarPorDocumento({ nit, dpi });
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError("Error en base de datos al buscar cliente", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
