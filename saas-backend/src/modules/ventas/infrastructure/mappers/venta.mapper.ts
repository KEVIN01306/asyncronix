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
            cliente_nombre: venta.cliente ? `${venta.cliente.nombre} ${venta.cliente.apellido || ''}`.trim() : undefined,
            cliente: venta.cliente ? {
                id: venta.cliente.id,
                nombre: `${venta.cliente.nombre} ${venta.cliente.apellido || ''}`.trim(),
                dpi: venta.cliente.dpi ?? null
            } : null,
            vehiculo: venta.servicio?.vehiculo ? {
                id: venta.servicio.vehiculo.id,
                placa: venta.servicio.vehiculo.placa,
                modelo: venta.servicio.vehiculo.modelo ? {
                    id: venta.servicio.vehiculo.modelo.id,
                    modelo: venta.servicio.vehiculo.modelo.modelo
                } : null
            } : null
        };
    }

    static mapDetalle(venta: any): VentaObtenerDetalle {
        return {
            ...this.mapSimple(venta),
            detalles: (venta.detalles ?? []).map((d: any) => ({
                id: d.id,
                variante_id: d.variante_id ?? d.lote?.variante_id ?? null,
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
