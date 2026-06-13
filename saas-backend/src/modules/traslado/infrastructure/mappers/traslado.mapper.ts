import type { TrasladoDetalle } from '../../domain/traslado.entity.js';

export class TrasladoMapper {
    static mapDetalle(traslado: any): TrasladoDetalle {
        return {
            id: traslado.id,
            consecutivo: traslado.consecutivo,
            origen_id: traslado.origen_id,
            destino_id: traslado.destino_id,
            creador_id: traslado.creador_id,
            estado: traslado.estado,
            created_at: traslado.created_at.toISOString(),
            updated_at: traslado.updated_at.toISOString(),
            origen: {
                id: traslado.origen.id,
                nombre: traslado.origen.nombre,
            },
            destino: {
                id: traslado.destino.id,
                nombre: traslado.destino.nombre,
            },
            creador: {
                id: traslado.creador.id,
                nombre: traslado.creador.nombre,
                apellido: traslado.creador.apellido ?? null,
            },
            recibidor: traslado.recibidor ? {
                id: traslado.recibidor.id,
                nombre: traslado.recibidor.nombre,
                apellido: traslado.recibidor.apellido ?? null,
            } : null,
            recibidor_id: traslado.recibidor_id ?? null,
            fecha_recibido: traslado.fecha_recibido ? traslado.fecha_recibido.toISOString() : null,
            comentarios: traslado.comentarios ?? null,
            detalles: (traslado.detalles ?? []).map((detalle: any) => ({
                id: detalle.id,
                traslado_id: detalle.traslado_id,
                lote_id: detalle.lote_id,
                cantidad: detalle.cantidad,
                lote: detalle.lote ? {
                    id: detalle.lote.id,
                    variante_id: detalle.lote.variante_id,
                    proveedor_id: detalle.lote.proveedor_id,
                    codigo_lote: detalle.lote.codigo_lote,
                    cantidad_inicial: detalle.lote.cantidad_inicial,
                    cantidad_actual: detalle.lote.cantidad_actual,
                    costo_compra: detalle.lote.costo_compra,
                    precio_venta: detalle.lote.precio_venta,
                    fecha_ingreso: detalle.lote.fecha_ingreso.toISOString(),
                    fecha_vencimiento: detalle.lote.fecha_vencimiento ? detalle.lote.fecha_vencimiento.toISOString() : null,
                    activo: detalle.lote.activo,
                    sucursal: {
                        id: detalle.lote.sucursal.id,
                        nombre: detalle.lote.sucursal.nombre,
                    },
                    variante: detalle.lote.variante ? {
                        id: detalle.lote.variante.id,
                        sku: detalle.lote.variante.sku ?? null,
                        producto_id: detalle.lote.variante.producto_id ?? null,
                        producto: detalle.lote.variante.producto ? {
                            id: detalle.lote.variante.producto.id,
                            nombre: detalle.lote.variante.producto.nombre,
                        } : null,
                    } : undefined,
                } : undefined,
            })),
        };
    }
}
