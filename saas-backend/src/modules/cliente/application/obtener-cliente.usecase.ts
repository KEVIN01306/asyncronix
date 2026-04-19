import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { ClienteObtenidoDetalle } from "../domain/cliente.entity.js";
import type { ClienteRepository } from "../domain/cliente.repository.js";

export class ObtenerClienteUseCase {
    constructor(
        private readonly clienteRepository: ClienteRepository
    ) { }

    async execute(id: string, negocio_id: string): Promise<ClienteObtenidoDetalle> {
        try {
            const cliente = await this.clienteRepository.obtener(id, negocio_id);

            if (!cliente) {
                throw new AppError('No se encontró el cliente', 'DATA_NOT_FOUND', 404)
            }

            return cliente;
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500)
            }

            throw error
        }
    }
}
