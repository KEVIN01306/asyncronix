import type { CotizacionCompleta, CotizacionSimple } from "../../domain/cotizacion.entity.js";

export class CotizacionMapper {
    static toSimple(prismaData: any): CotizacionSimple {
        return {
            id: prismaData.id,
            negocio_id: prismaData.negocio_id,
            sucursal_id: prismaData.sucursal_id,
            usuario_id: prismaData.usuario_id,
            cliente_id: prismaData.cliente_id,
            vehiculo_id: prismaData.vehiculo_id,
            correlativo: prismaData.correlativo,
            codigo: prismaData.codigo,
            total: prismaData.total,
            fecha_emision: prismaData.fecha_emision,
            fecha_validez: prismaData.fecha_validez,
            estado: prismaData.estado,
            tipo_destino: prismaData.tipo_destino,
            terminos: prismaData.terminos,
            venta_id: prismaData.venta_id,
            preventa_id: prismaData.preventa_id,
            servicio_id: prismaData.servicio_id,
            created_at: prismaData.created_at,
            updated_at: prismaData.updated_at,
            cliente: prismaData.cliente ? {
                id: prismaData.cliente.id,
                nombre: prismaData.cliente.nombre,
                telefono: prismaData.cliente.telefono,
                email: prismaData.cliente.email
            } : null,
            vehiculo: prismaData.vehiculo ? {
                id: prismaData.vehiculo.id,
                placa: prismaData.vehiculo.placa
            } : null,
            usuario: prismaData.usuario ? {
                id: prismaData.usuario.id,
                nombre: prismaData.usuario.nombre,
                apellido: prismaData.usuario.apellido
            } : undefined
        };
    }

    static toCompleta(prismaData: any): CotizacionCompleta {
        const simple = this.toSimple(prismaData);
        return {
            ...simple,
            detalles: prismaData.detalles?.map((d: any) => ({
                id: d.id,
                cotizacion_id: d.cotizacion_id,
                variante_id: d.variante_id,
                tipo_servicio_id: d.tipo_servicio_id,
                descripcion: d.descripcion,
                cantidad: d.cantidad,
                precio_unitario: d.precio_unitario,
                descuento: d.descuento,
                subtotal: d.subtotal
            })) || []
        };
    }
}
