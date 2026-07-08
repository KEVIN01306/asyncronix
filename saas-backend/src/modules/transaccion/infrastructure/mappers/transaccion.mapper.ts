import type { Transaccion as PrismaTransaccion } from '@prisma/client';
import type { TransaccionDetalle, TransaccionSimple } from '../domain/transaccion.entity.js';

export class TransaccionMapper {
    static mapSimple(data: any): TransaccionSimple {
        return {
            id: data.id,
            categoria_id: data.categoria_id,
            usuario_id: data.usuario_id,
            tipo_movimiento: data.tipo_movimiento,
            origen_tipo: data.origen_tipo,
            moneda_id: data.moneda_id,
            monto_original: data.monto_original,
            tipo_cambio: data.tipo_cambio,
            monto_moneda_base: data.monto_moneda_base,
            descripcion: data.descripcion,
            origen_entidad: data.origen_entidad,
            origen_caja_id: data.origen_caja_id,
            origen_cuenta_id: data.origen_cuenta_id,
            destino_entidad: data.destino_entidad,
            destino_caja_id: data.destino_caja_id,
            destino_cuenta_id: data.destino_cuenta_id,
            fecha_transaccion: data.fecha_transaccion,
            created_at: data.created_at,
            moneda_actual_codigo: data.moneda_actual?.codigo,
            categoria_nombre: data.categoria?.nombre,
            usuario_nombre: data.usuario?.nombre,
            moneda_codigo: data.moneda?.codigo,
            entidad_nombre: data.origen_caja?.nombre || data.origen_cuenta?.numero_cuenta || 
                           data.destino_caja?.nombre || data.destino_cuenta?.numero_cuenta,
        };
    }

    static mapDetalle(data: any): TransaccionDetalle {
        return {
            id: data.id,
            negocio_id: data.negocio_id,
            sucursal_id: data.sucursal_id,
            categoria_id: data.categoria_id,
            usuario_id: data.usuario_id,
            tipo_movimiento: data.tipo_movimiento,
            origen_tipo: data.origen_tipo,
            moneda_id: data.moneda_id,
            monto_original: data.monto_original,
            tipo_cambio: data.tipo_cambio,
            monto_moneda_base: data.monto_moneda_base,
            descripcion: data.descripcion,
            origen_entidad: data.origen_entidad,
            origen_caja_id: data.origen_caja_id,
            origen_cuenta_id: data.origen_cuenta_id,
            destino_entidad: data.destino_entidad,
            destino_caja_id: data.destino_caja_id,
            destino_cuenta_id: data.destino_cuenta_id,
            fecha_transaccion: data.fecha_transaccion,
            created_at: data.created_at,
            moneda_actual_id: data.moneda_actual_id,
            moneda_actual: data.moneda_actual ? {
                id: data.moneda_actual.id,
                codigo: data.moneda_actual.codigo,
                nombre: data.moneda_actual.nombre,
                simbolo: data.moneda_actual.simbolo,
            } : null,
            categoria: data.categoria ? { id: data.categoria.id, nombre: data.categoria.nombre } : null,
            usuario: data.usuario ? { id: data.usuario.id, nombre: data.usuario.nombre } : undefined,
            moneda: data.moneda,
            negocio: data.negocio,
            caja: data.origen_caja || data.destino_caja,
            cuenta: data.origen_cuenta || data.destino_cuenta,
        };
    }
}
