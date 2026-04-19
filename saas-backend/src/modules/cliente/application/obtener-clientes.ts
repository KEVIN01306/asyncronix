import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { Paginated } from "../../../shared/domain/paginated.js";
import type { ClienteSimple } from "../domain/cliente.entity.js";
import type { ClienteRepository } from "../domain/cliente.repository.js";

export class ObtenerClientesUseCase {
    constructor(
        private readonly clienteRepository: ClienteRepository
    ) { }

    async execute(params: { negocio_id: string; page: number; perPage: number }): Promise<Paginated<ClienteSimple>> {
        try {
            return await this.clienteRepository.listar(params);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500)
            }

            throw error
        }
    }
}
