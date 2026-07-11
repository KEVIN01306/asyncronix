import type { IngresoEgresoEntity, IngresoEgresoEntidad, TransaccionSimple, TransaccionDetalle } from '../../domain/transaccion.entity.js';

export class TransaccionMapper {
    /**
     * Maps a Prisma transaccion row (with includes) to the semantic
     * IngresoEgresoEntity used by the Ingresos-Egresos module.
     *
     * Works for both list items and detail views since the same entity
     * shape is used in both cases.
     */
    static mapIngresoEgreso(data: any): IngresoEgresoEntity {
        const tipo_movimiento: 'INGRESO' | 'EGRESO' = data.tipo_movimiento;

        // For INGRESO the financial entity is the destination.
        // For EGRESO the financial entity is the origin.
        const entidadTipo = tipo_movimiento === 'INGRESO'
            ? data.destino_entidad
            : data.origen_entidad;

        let entidad: IngresoEgresoEntidad | null = null;

        if (entidadTipo === 'CAJA') {
            const caja = tipo_movimiento === 'INGRESO' ? data.destino_caja : data.origen_caja;
            entidad = {
                tipo: 'CAJA',
                id: caja?.id ?? (tipo_movimiento === 'INGRESO' ? data.destino_caja_id : data.origen_caja_id) ?? '',
                nombre: caja?.nombre ?? null,
            };
        } else if (entidadTipo === 'CUENTA') {
            const cuenta = tipo_movimiento === 'INGRESO' ? data.destino_cuenta : data.origen_cuenta;
            entidad = {
                tipo: 'CUENTA',
                id: cuenta?.id ?? (tipo_movimiento === 'INGRESO' ? data.destino_cuenta_id : data.origen_cuenta_id) ?? '',
                nombre: cuenta?.numero_cuenta ?? null,
                banco: cuenta?.banco?.nombre_comercial ?? null,
                moneda_codigo: cuenta?.moneda?.codigo ?? null,
            };
        }

        return {
            id: data.id,
            correlativo: data.correlativo,
            codigo: data.codigo,
            tipo: tipo_movimiento,
            descripcion: data.descripcion ?? null,
            negocio: {
                id: data.negocio_id,
            },
            sucursal: {
                id: data.sucursal_id,
            },
            categoria: data.categoria
                ? { id: data.categoria.id, nombre: data.categoria.nombre }
                : null,
            usuario: {
                id: data.usuario_id,
                nombre: data.usuario?.nombre ?? '',
                apellido: data.usuario?.apellido ?? null,
                avatar: data.usuario?.avatar_url ?? null,
            },
            monto: {
                original: data.monto_original,
                moneda_base: data.monto_moneda_base,
                tipo_cambio: data.tipo_cambio,
            },
            moneda: data.moneda
                ? {
                    id: data.moneda.id,
                    codigo: data.moneda.codigo,
                    nombre: data.moneda.nombre,
                    simbolo: data.moneda.simbolo,
                }
                : null,
            moneda_base: data.moneda_actual
                ? {
                    id: data.moneda_actual.id,
                    codigo: data.moneda_actual.codigo,
                    nombre: data.moneda_actual.nombre,
                    simbolo: data.moneda_actual.simbolo,
                }
                : null,
            entidad,
            fechas: {
                transaccion: data.fecha_transaccion,
                creacion: data.created_at,
            },
        };
    }

    // ── Legacy mappers (kept for backward compatibility) ──────────────────────

    static mapSimple(data: any): TransaccionSimple {
        return {
            id: data.id,
            categoria_id: data.categoria_id,
            usuario_id: data.usuario_id,
            codigo: data.codigo,
            correlativo: data.correlativo,
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
            entidad_nombre:
                data.origen_caja?.nombre ||
                data.origen_cuenta?.numero_cuenta ||
                data.destino_caja?.nombre ||
                data.destino_cuenta?.numero_cuenta,
        };
    }

    static mapDetalle(data: any): TransaccionDetalle {
        return {
            id: data.id,
            negocio_id: data.negocio_id,
            sucursal_id: data.sucursal_id,
            categoria_id: data.categoria_id,
            usuario_id: data.usuario_id,
            codigo: data.codigo,
            correlativo: data.correlativo,
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
            moneda_actual: data.moneda_actual
                ? {
                    id: data.moneda_actual.id,
                    codigo: data.moneda_actual.codigo,
                    nombre: data.moneda_actual.nombre,
                    simbolo: data.moneda_actual.simbolo,
                }
                : null,
            categoria: data.categoria
                ? { id: data.categoria.id, nombre: data.categoria.nombre }
                : null,
            usuario: data.usuario
                ? { id: data.usuario.id, nombre: data.usuario.nombre }
                : null,
            moneda: data.moneda,
            negocio: data.negocio,
            caja: data.origen_caja || data.destino_caja,
            cuenta: data.origen_cuenta || data.destino_cuenta,
        };
    }
}
