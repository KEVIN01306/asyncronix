import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { ClienteObtenidoDetalle } from "../domain/cliente.entity.js";
import type { ClienteRepository } from "../domain/cliente.repository.js";

export class BuscarClientePorDocumentoUseCase {
    constructor(
        private readonly clienteRepository: ClienteRepository
    ) { }

    async execute(data: { nit?: string | null; dpi?: string | null }, negocio_id: string): Promise<ClienteObtenidoDetalle | null> {
        try {
            return await this.clienteRepository.buscarPorDocumento(data, negocio_id);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500)
            }
            throw error
        }
    }
}
