import type { VentaSimple, VentaObtenerDetalle } from "../../domain/venta.entity.js";

export class VentaMapper {
    static mapSimple(venta: any): VentaSimple {
        return {
            id: venta.id,
            negocio_id: venta.negocio_id,
            sucursal_id: venta.sucursal_id,
            usuario_id: venta.usuario_id,
            cliente_id: venta.cliente_id,
            total: venta.total,
            total_costo: venta.total_costo,
            comentarios: venta.comentarios ?? null,
            estado: venta.estado,
            metodo_pago: venta.metodo_pago,
            created_at: venta.created_at,
            updated_at: venta.updated_at,
            vendedor_nombre: `${venta.usuario.nombre} ${venta.usuario.apellido || ''}`.trim(),
            cliente_nombre: venta.cliente ? `${venta.cliente.nombre} ${venta.cliente.apellido || ''}`.trim() : undefined
        };
    }

    static mapDetalle(venta: any): VentaObtenerDetalle {
        return {
            ...this.mapSimple(venta),
            detalles: venta.detalles.map((d: any) => ({
                id: d.id,
                producto_id: d.lote?.producto_id ?? null,
                lote_id: d.lote_id,
                descripcion: d.descripcion,
                cantidad: d.cantidad,
                precio_unitario: d.precio_unitario,
                costo_unitario: d.costo_unitario,
                subtotal: d.cantidad * d.precio_unitario
            }))
        };
    }
}
