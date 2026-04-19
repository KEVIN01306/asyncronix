import type { Paginated } from "@shared/domain/paginated.js";
import type { Proveedor, ProveedorActualizar, ProveedorCrear, ProveedorObtenidoDetalle, ProveedorSimple } from "./proveedor.entity.js";

export interface ProveedorRepository {
    registrar(data: ProveedorCrear, negocio_id: string): Promise<ProveedorObtenidoDetalle>;
    actualizar(id: string, negocio_id: string, data: ProveedorActualizar): Promise<ProveedorObtenidoDetalle>;
    eliminar(id: string, negocio_id: string): Promise<void>;
    obtener(id: string, negocio_id: string): Promise<ProveedorObtenidoDetalle | null>;
    listar(params: { negocio_id: string; page: number; perPage: number }): Promise<Paginated<ProveedorSimple>>;
}
