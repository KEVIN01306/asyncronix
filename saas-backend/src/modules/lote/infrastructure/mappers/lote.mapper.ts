import type { LoteDetalle } from "@modules/lote/domain/lote.entity.js";

export class LoteMapper {
    static mapDetalle(lote: any): LoteDetalle {
        return {
            id: lote.id,
            producto_id: lote.producto_id,
            negocio_id: lote.negocio_id,
            sucursal_id: lote.sucursal_id,
            cantidad_actual: lote.cantidad_actual,
            costo_compra: lote.costo_compra,
            precio_venta: lote.precio_venta,
            fecha_ingreso: lote.fecha_ingreso?.toISOString ? lote.fecha_ingreso.toISOString() : lote.fecha_ingreso,
            activo: lote.activo,
            producto: {
                id: lote.producto?.id ?? lote.producto_id,
                nombre: lote.producto?.nombre ?? '',
            },
            sucursal: {
                id: lote.sucursal?.id ?? lote.sucursal_id,
                nombre: lote.sucursal?.nombre ?? '',
            },
        }
    }
}
