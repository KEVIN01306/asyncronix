import type { Pagination } from "../../../shared/domain/pagination.js";
import type { Paginated } from "../../../shared/domain/paginated.js";
import type { VentaSimple, VentaObtenerDetalle, VentaCrear, VentaActualizar, MetodoPago } from "./venta.entity.js";

export interface VentaRepository {
    registrar(data: VentaCrear, negocio_id: string, sucursal_id: string, usuario_id: string): Promise<VentaObtenerDetalle>;
    actualizar(id: string, data: VentaActualizar, negocio_id: string, sucursal_id: string): Promise<VentaSimple>;
    anular(id: string, negocio_id: string, sucursal_id: string, comentario: string): Promise<VentaSimple>;
    obtener(id: string, negocio_id: string, sucursal_id: string): Promise<VentaObtenerDetalle | null>;
    listar(negocio_id: string, sucursal_id: string, pagination: Pagination, cliente_id?: string | null, metodo_pago?: MetodoPago, q?: string, fecha_inicio?: string | null, fecha_fin?: string | null): Promise<Paginated<VentaSimple>>;
    crearDetalle(ventaId: string, detalle: any, negocio_id: string, sucursal_id: string): Promise<any>;
    eliminarDetalle(ventaId: string, detalleId: string, negocio_id: string, sucursal_id: string): Promise<void>;
    finalizarVenta(ventaId: string, negocio_id: string, sucursal_id: string, metodo_pago?: MetodoPago, options?: { tx?: any }): Promise<VentaSimple>;
    crearDetallesAtomicos(ventaId: string, detalles: any[], negocio_id: string, sucursal_id: string): Promise<any[]>;
}
