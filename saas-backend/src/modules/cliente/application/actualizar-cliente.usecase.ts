import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import { NotFoundPersistenceError } from "@shared/database/errors/NotFoundPersistenceError.js";
import { UniqueConstraintError } from "@shared/database/errors/UniqueConstraintError.js";
import type { ClienteActualizar, ClienteObtenidoDetalle } from "../domain/cliente.entity.js";
import type { ClienteRepository } from "../domain/cliente.repository.js";

export class ActualizarClienteUseCase {
    constructor(
        private readonly clienteRepository: ClienteRepository
    ) { }

    async execute(id: string, negocio_id: string, data: ClienteActualizar): Promise<ClienteObtenidoDetalle> {
        try {
            return await this.clienteRepository.actualizar(id, negocio_id, data);
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) {
                throw new AppError('No se encontró el cliente para actualizar', 'DATA_NOT_FOUND', 404)
            }

            if (error instanceof UniqueConstraintError) {
                throw new AppError('El teléfono ya está en uso por otro cliente', 'DATA_ALREADY_EXISTS', 409)
            }

            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500)
            }

            throw error
        }
    }
}
