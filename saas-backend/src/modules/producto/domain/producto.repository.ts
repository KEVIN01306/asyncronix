import type {
    ProductoActualizar,
    ProductoAtributo,
    ProductoCrear,
    ProductoSimple,
    ProductoDetalle
} from "./producto.entity.js";
import type { Pagination } from "@shared/domain/pagination.js";
import type { Paginated } from "@shared/domain/paginated.js";

export interface ProductoRepository {
    registrar(producto: ProductoCrear, negocio_id: string): Promise<ProductoDetalle>;
    actualizar(id: string, producto: ProductoActualizar, negocio_id: string): Promise<ProductoDetalle>;
    eliminar(id: string, negocio_id: string): Promise<void>;
    obtener(id: string, negocio_id: string): Promise<ProductoDetalle | null>;
    listar(negocio_id: string, pagination: Pagination, categoria_id?: string): Promise<Paginated<ProductoSimple>>;
    registrarImagen(producto_id: string, url_imagen: string, negocio_id: string): Promise<ProductoDetalle>;
    listarAtributosProducto(producto_id: string, negocio_id: string): Promise<ProductoAtributo[] | null>;
    actualizarAtributosProducto(producto_id: string, negocio_id: string, atributo_ids: string[]): Promise<ProductoAtributo[] | null>;
}
