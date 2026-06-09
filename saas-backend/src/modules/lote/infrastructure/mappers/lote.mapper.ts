import type { LoteDetalle } from "@modules/lote/domain/lote.entity.js";

export class LoteMapper {
    static mapDetalle(lote: any): LoteDetalle {
        return {
            codigo_lote: lote.codigo_lote,
            id: lote.id,
            variante_id: lote.variante_id,
            negocio_id: lote.negocio_id,
            sucursal_id: lote.sucursal_id,
            proveedor_id: lote.proveedor_id,
            cantidad_inicial: lote.cantidad_inicial,
            cantidad_actual: lote.cantidad_actual,
            costo_compra: lote.costo_compra,
            precio_venta: lote.precio_venta,
            fecha_ingreso: lote.fecha_ingreso?.toISOString ? lote.fecha_ingreso.toISOString() : lote.fecha_ingreso,
            fecha_vencimiento: lote.fecha_vencimiento?.toISOString ? lote.fecha_vencimiento.toISOString() : lote.fecha_vencimiento,
            activo: lote.activo,
            variante: {
                id: lote.variante?.id ?? lote.variante_id,
                sku: lote.variante?.sku ?? undefined,
                producto_id: lote.variante?.producto_id ?? undefined,
                producto_nombre: lote.variante?.producto?.nombre ?? lote.variante?.producto_nombre ?? undefined,
            },
            sucursal: {
                id: lote.sucursal?.id ?? lote.sucursal_id,
                nombre: lote.sucursal?.nombre ?? '',
            },
        }
    }
}
