import AppError from "@shared/errors/AppError.js";
import type { LoteDetalle } from "../domain/lote.entity.js";
import type { LoteRepository } from "../domain/lote.repository.js";
import type { Pagination } from "@shared/domain/pagination.js";

export class ObtenerLotesUseCase {
    constructor(private readonly repository: LoteRepository) { }

    async execute(variante_id: string, negocio_id: string, pagination: Pagination, sucursal_id?: string): Promise<{ total: number; data: LoteDetalle[]; stock?: number }> {
        try {
            const result = await this.repository.listarPorVariante(variante_id, negocio_id, pagination, sucursal_id);
            return result;
        } catch (error) {
            throw error;
        }
    }
}
