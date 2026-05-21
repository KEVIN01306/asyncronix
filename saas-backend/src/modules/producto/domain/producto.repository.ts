import type {
    ProductoActualizar,
    ProductoCrear,
    ProductoSimple,
    ProductoDetalle
} from "./producto.entity.js";
import type { Pagination } from "@shared/domain/pagination.js";
import type { Paginated } from "@shared/domain/paginated.js";

export interface ProductoRepository {
    registrar(producto: ProductoCrear, negocio_id: string): Promise<ProductoDetalle>;
    actualizarSku(id: string, negocio_id: string, newSku: string): Promise<ProductoDetalle>;
    actualizar(id: string, producto: ProductoActualizar, negocio_id: string): Promise<ProductoDetalle>;
    obtenerPorSku(sku: string, negocio_id: string): Promise<ProductoDetalle | null>;
    actualizarQrImagen(producto_id: string, qr_imagen: string, negocio_id: string): Promise<ProductoDetalle>;
    eliminar(id: string, negocio_id: string): Promise<void>;
    obtener(id: string, negocio_id: string): Promise<ProductoDetalle | null>;
    listar(negocio_id: string, pagination: Pagination, categoria_id?: string): Promise<Paginated<ProductoSimple>>;
    registrarImagen(producto_id: string, url_imagen: string, negocio_id: string): Promise<ProductoDetalle>;
}
