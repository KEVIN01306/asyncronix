import type { Paginated } from '@shared/domain/paginated.js';
import type { Pagination } from '@shared/domain/pagination.js';
import type { TrasladoDetalle } from '../domain/traslado.entity.js';
import type { TrasladoRepository } from '../domain/traslado.repository.js';

export interface ListarTrasladosQuery {
    q?: string | null;
    guia?: string | null;
    creador?: string | null;
    recibidor?: string | null;
    estado?: 'PENDIENTE' | 'COMPLETADO' | 'CANCELADO';
    fecha_inicio?: string | null;
    fecha_fin?: string | null;
    fecha_recibido_inicio?: string | null;
    fecha_recibido_fin?: string | null;
}

export class ListarTrasladosPorDestinoUseCase {
    constructor(private readonly repository: TrasladoRepository) { }

    async execute(
        negocio_id: string,
        destino_id: string,
        pagination: Pagination,
        query: ListarTrasladosQuery,
    ): Promise<Paginated<TrasladoDetalle>> {
        return this.repository.listarPorDestino(negocio_id, destino_id, pagination, query);
    }
}
