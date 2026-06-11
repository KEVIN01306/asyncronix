import type { Paginated } from '@shared/domain/paginated.js';
import type { Pagination } from '@shared/domain/pagination.js';
import type { TrasladoDetalle } from '../domain/traslado.entity.js';
import type { TrasladoRepository } from '../domain/traslado.repository.js';

export class ListarTrasladosPorOrigenUseCase {
    constructor(private readonly repository: TrasladoRepository) { }

    async execute(negocio_id: string, origen_id: string, pagination: Pagination): Promise<Paginated<TrasladoDetalle>> {
        return this.repository.listarPorOrigen(negocio_id, origen_id, pagination);
    }
}
