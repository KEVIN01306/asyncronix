import type { Paginated } from '@shared/domain/paginated.js';
import type { CategoriaTransaccion, CategoriaTransaccionActualizar, CategoriaTransaccionCrear, CategoriaTransaccionSimple } from './categoria-transaccion.entity.js';

export interface CategoriaTransaccionRepository {
  registrar(data: CategoriaTransaccionCrear, negocio_id: string): Promise<CategoriaTransaccionSimple>;
  actualizar(id: string, negocio_id: string, data: CategoriaTransaccionActualizar): Promise<CategoriaTransaccionSimple>;
  eliminar(id: string, negocio_id: string): Promise<void>;
  obtener(id: string, negocio_id: string): Promise<CategoriaTransaccionSimple | null>;
  listar(negocio_id: string, page: number, perPage: number, filters?: { q?: string; tipo?: string | null }): Promise<Paginated<CategoriaTransaccionSimple>>;
}
