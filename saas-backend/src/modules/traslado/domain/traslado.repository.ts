import type { Paginated } from '@shared/domain/paginated.js';
import type { Pagination } from '@shared/domain/pagination.js';
import type { TrasladoCrear, TrasladoDetalle } from './traslado.entity.js';

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

export interface TrasladoRepository {
    registrar(data: TrasladoCrear, negocio_id: string, creador_id: string, origen_id: string): Promise<TrasladoDetalle>;
    obtener(id: string, negocio_id: string): Promise<TrasladoDetalle | null>;
    listarPorOrigen(negocio_id: string, origen_id: string, pagination: Pagination, query: ListarTrasladosQuery): Promise<Paginated<TrasladoDetalle>>;
    listarPorDestino(negocio_id: string, destino_id: string, pagination: Pagination, query: ListarTrasladosQuery): Promise<Paginated<TrasladoDetalle>>;
    cancelar(id: string, negocio_id: string, origen_id: string, comentario: string): Promise<void>;
    recibir(id: string, negocio_id: string, destino_id: string, recibidor_id: string, comentario: string): Promise<void>;
}
