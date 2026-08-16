import type { Paginated } from "@shared/domain/paginated.js";
import type { Pagination } from "@shared/domain/pagination.js";
import type { CotizacionSimple, CotizacionCompleta, CotizacionCrear, CotizacionActualizarEstado } from "./cotizacion.entity.js";

export interface CotizacionRepository {
    crear(data: CotizacionCrear, negocio_id: string, sucursal_id: string, usuario_id: string): Promise<CotizacionCompleta>;
    obtener(id: string, negocio_id: string, sucursal_id: string): Promise<CotizacionCompleta | null>;
    listar(negocio_id: string, sucursal_id: string, pagination: Pagination, q?: string, estado?: string, cliente_id?: string): Promise<Paginated<CotizacionSimple>>;
    actualizarEstado(id: string, estado: string, negocio_id: string, sucursal_id: string): Promise<CotizacionSimple>;
    marcarConvertida(id: string, tipoDestino: 'VENTA_DIRECTA' | 'TALLER', referenciaId: string, negocio_id: string, sucursal_id: string, options?: { tx?: any }): Promise<void>;
}
