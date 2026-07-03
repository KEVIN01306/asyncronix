import type { Categoria, CategoriaActualizar, CategoriaCrear, CategoriaSimple } from "./categoria.entity.js";
import type { Pagination } from "@shared/domain/pagination.js";
import type { Paginated } from "@shared/domain/paginated.js";

export interface CategoriaRepository {
    registrar(categoria: CategoriaCrear, negocio_id: string): Promise<CategoriaSimple>;
    actualizar(id: string, categoria: CategoriaActualizar, negocio_id: string): Promise<CategoriaSimple>;
    eliminar(id: string, negocio_id: string): Promise<void>;
    obtener(id: string, negocio_id: string): Promise<CategoriaSimple | null>;
    obtenerPorId(id: string, negocio_id: string): Promise<any | null>;
    obtenerDefaultPorCategoria(categoria: Categoria['categoria']): Promise<CategoriaSimple | null>;
    listar(negocio_id: string, pagination: Pagination, q?: string | null): Promise<Paginated<CategoriaSimple>>;
    obtenerTodas(negocio_id: string): Promise<CategoriaSimple[]>;
    obtenerSubcategorias(categoria_padre_id: string, negocio_id: string): Promise<CategoriaSimple[]>;
}
