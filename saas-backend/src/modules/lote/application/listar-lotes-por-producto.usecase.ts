import type { LoteDetalle } from '../domain/lote.entity.js';
import type { LoteRepository } from '../domain/lote.repository.js';
import type { Pagination } from '@shared/domain/pagination.js';

export class ListarLotesPorProductoUseCase {
    constructor(private readonly repository: LoteRepository) { }

    async execute(producto_id: string, negocio_id: string, pagination: Pagination): Promise<{ total: number; data: LoteDetalle[] }> {
        return await this.repository.listarPorProducto(producto_id, negocio_id, pagination);
    }
}
