import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { ClienteObtenidoDetalle } from "../../cliente/domain/cliente.entity.js";
import type { ClienteRepository } from "../../cliente/domain/cliente.repository.js";

export class BuscarClientePorNitVentaUseCase {
    constructor(
        private readonly clienteRepository: ClienteRepository
    ) { }

    async execute(nit: string, negocio_id: string): Promise<ClienteObtenidoDetalle | null> {
        try {
            return await this.clienteRepository.buscarPorDocumento({ nit, dpi: null }, negocio_id);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500)
            }
            throw error
        }
    }
}
