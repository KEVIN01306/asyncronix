import type { Paginated } from '@shared/domain/paginated.js';
import type { Pagination } from '@shared/domain/pagination.js';
import type { TrasladoCrear, TrasladoDetalle } from './traslado.entity.js';

export interface TrasladoRepository {
    registrar(data: TrasladoCrear, negocio_id: string, creador_id: string, origen_id: string): Promise<TrasladoDetalle>;
    obtener(id: string, negocio_id: string): Promise<TrasladoDetalle | null>;
    listarPorOrigen(negocio_id: string, origen_id: string, pagination: Pagination): Promise<Paginated<TrasladoDetalle>>;
    listarPorDestino(negocio_id: string, destino_id: string, pagination: Pagination): Promise<Paginated<TrasladoDetalle>>;
    cancelar(id: string, negocio_id: string, origen_id: string): Promise<void>;
    recibir(id: string, negocio_id: string, destino_id: string): Promise<void>;
}
