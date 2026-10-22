import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { ClienteSimple } from "../domain/cliente.entity.js";
import type { ClienteRepository } from "../domain/cliente.repository.js";
import { normalizarDpi } from "../domain/utils/normalizar-dpi.js";

export class BuscarClienteGlobalUseCase {
    constructor(
        private readonly clienteRepository: ClienteRepository
    ) { }

    async execute(params: { q?: string | null; documento?: string | null; limit?: number }): Promise<ClienteSimple[]> {
        try {
            const limit = Math.min(params.limit || 10, 50);
            const q = params.q?.trim() || null;
            const docRaw = params.documento?.trim() || null;
            const docNormalizado = normalizarDpi(docRaw) || docRaw;

            return await this.clienteRepository.buscarGlobal({
                q,
                documento: docNormalizado,
                limit
            });
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError("Error en base de datos al buscar clientes globales", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
