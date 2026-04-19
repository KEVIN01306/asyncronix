import type {
    Producto,
    ProductoActualizar,
    ProductoCrear,
    ProductoSimple,
    ProductoDetalle,
    ProductoImagen,

    ProductoImagenCrear,
    ProductoImagenActualizar
} from "./producto.entity.js";
import type { Pagination } from "@shared/domain/pagination.js";
import type { Paginated } from "@shared/domain/paginated.js";

export interface ProductoRepository {
    // Productos
    registrar(producto: ProductoCrear, negocio_id: string): Promise<ProductoDetalle>;
    actualizar(id: string, producto: ProductoActualizar, negocio_id: string): Promise<ProductoDetalle>;
    eliminar(id: string, negocio_id: string): Promise<void>;
    obtener(id: string, negocio_id: string): Promise<ProductoDetalle | null>;
    listar(negocio_id: string, pagination: Pagination, categoria_id?: string): Promise<Paginated<ProductoSimple>>;


    // Imagenes
    registrarImagen(imagen: ProductoImagenCrear): Promise<ProductoImagen>;
    actualizarImagen(id: string, data: ProductoImagenActualizar): Promise<ProductoImagen>;
    eliminarImagen(id: string): Promise<void>;
    eliminarImagenesBulk(ids: string[]): Promise<void>;
    obtenerImagen(id: string): Promise<ProductoImagen | null>;
}
