import type {
    ProductoActualizar,
    ProductoAtributo,
    ProductoCrear,
    ImagenProducto,
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
    listar(negocio_id: string, pagination: Pagination, categoria_id?: string, q?: string | null, sku?: string | null): Promise<Paginated<ProductoSimple>>;
    registrarImagen(producto_id: string, url: string, descripcion: string | null, negocio_id: string): Promise<ProductoDetalle>;
    listarImagenes(producto_id: string, negocio_id: string): Promise<ImagenProducto[]>;
    obtenerImagen(imagen_id: string, negocio_id: string): Promise<ImagenProducto | null>;
    actualizarArchivoImagen(imagen_id: string, url: string, negocio_id: string): Promise<ImagenProducto>;
    actualizarDescripcionImagen(imagen_id: string, descripcion: string | null, negocio_id: string): Promise<ImagenProducto>;
    establecerImagenPrincipal(imagen_id: string, negocio_id: string): Promise<ImagenProducto>;
    eliminarImagen(imagen_id: string, negocio_id: string): Promise<void>;
    listarAtributosProducto(producto_id: string, negocio_id: string): Promise<ProductoAtributo[] | null>;
    actualizarAtributosProducto(producto_id: string, negocio_id: string, atributo_ids: string[]): Promise<ProductoAtributo[] | null>;
    contar(negocio_id: string): Promise<number>;
}
