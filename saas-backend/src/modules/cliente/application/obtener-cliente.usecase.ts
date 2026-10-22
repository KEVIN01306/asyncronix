import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { ClienteObtenidoDetalle } from "../domain/cliente.entity.js";
import type { ClienteRepository } from "../domain/cliente.repository.js";

export class ObtenerClienteUseCase {
    constructor(
        private readonly clienteRepository: ClienteRepository
    ) { }

    async execute(id: string, _negocio_id: string): Promise<ClienteObtenidoDetalle> {
        try {
            const cliente = await this.clienteRepository.obtenerPorId(id);
            if (!cliente) {
                throw new AppError("Cliente no encontrado", "DATA_NOT_FOUND", 404);
            }
            return cliente;
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof DatabaseError) {
                throw new AppError("Error en base de datos al obtener el cliente", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
