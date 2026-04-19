import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import { UniqueConstraintError } from "@shared/database/errors/UniqueConstraintError.js";
import type { ClienteCrear, ClienteObtenidoDetalle } from "../domain/cliente.entity.js";
import type { ClienteRepository } from "../domain/cliente.repository.js";

export class RegistrarClienteUseCase {
    constructor(
        private readonly clienteRepository: ClienteRepository
    ) { }

    async execute(data: ClienteCrear, negocio_id: string): Promise<ClienteObtenidoDetalle> {
        try {
            return await this.clienteRepository.registrar(data, negocio_id);
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new AppError('El cliente ya existe en este negocio', 'DATA_ALREADY_EXISTS', 409)
            }

            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500)
            }

            throw error
        }
    }
}
