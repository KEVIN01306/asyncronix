import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import { NotFoundPersistenceError } from "@shared/database/errors/NotFoundPersistenceError.js";
import type { ClienteRepository } from "../domain/cliente.repository.js";

export class EliminarClienteUseCase {
    constructor(
        private readonly clienteRepository: ClienteRepository
    ) { }

    async execute(id: string, negocio_id: string): Promise<void> {
        try {
            await this.clienteRepository.eliminar(id, negocio_id);
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) {
                throw new AppError('No se encontró el cliente para eliminar', 'DATA_NOT_FOUND', 404)
            }

            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500)
            }

            throw error
        }
    }
}
