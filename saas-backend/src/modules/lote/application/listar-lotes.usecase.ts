import type { LoteDetalle } from "../domain/lote.entity.js";
import type { LoteRepository } from "../domain/lote.repository.js";
import type { Pagination } from "@shared/domain/pagination.js";

export class ListarLotesUseCase {
    constructor(private readonly repository: LoteRepository) { }

    async execute(negocio_id: string,sucursal_id: string, pagination: Pagination, filters: Record<string, any> = {}): Promise<{ total: number; data: LoteDetalle[] }> {

        const { total, data } = await this.repository.listar(negocio_id, sucursal_id, pagination, filters);
        return { total, data };
    }
}
