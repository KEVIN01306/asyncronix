import type { PrismaClient } from '@prisma/client';
import type { ReporteRepository } from '../../domain/repositories/reporte.repository.js';
import type { FiltrosReporteFinanciero, ReporteFinanciero, MetodoPagoKPI, OrigenDineroKPI, CajaKPI, CuentaBancariaKPI } from '../../domain/models/reporte-financiero.model.js';
import { PrismaErrorMapper } from '@shared/database/prisma/PrismaErrorMapper.js';

export class PrismaReporteRepository implements ReporteRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async obtenerReporteFinanciero(filtros: FiltrosReporteFinanciero): Promise<ReporteFinanciero> {
        try {
            const whereTransacciones: any = {
                negocio_id: filtros.negocio_id,
            };

            if (filtros.sucursal_ids.length > 0) {
                whereTransacciones.sucursal_id = { in: filtros.sucursal_ids };
            }

            if (filtros.fecha_inicio || filtros.fecha_fin) {
                whereTransacciones.fecha_transaccion = {};
                if (filtros.fecha_inicio) {
                    whereTransacciones.fecha_transaccion.gte = new Date(filtros.fecha_inicio + 'T00:00:00');
                }
                if (filtros.fecha_fin) {
                    whereTransacciones.fecha_transaccion.lte = new Date(filtros.fecha_fin + 'T23:59:59.999');
                }
            }

            if (filtros.metodos_pago && filtros.metodos_pago.length > 0) {
                whereTransacciones.metodo_pago = { in: filtros.metodos_pago };
            }

            // Para entidad_tipos, verificamos destino para ingresos y origen para egresos, pero
            // un enfoque simple para el filtro general de la transacción:
            if (filtros.entidad_tipos && filtros.entidad_tipos.length > 0) {
                whereTransacciones.OR = filtros.entidad_tipos.map(tipo => ({
                    OR: [
                        { origen_entidad: tipo },
                        { destino_entidad: tipo }
                    ]
                })).flat();
            }

            // Agregaciones de ingresos
            const ingresosResult = await this.prisma.transaccion.aggregate({
                _sum: { monto_moneda_base: true },
                _count: { id: true },
                where: { ...whereTransacciones, tipo_movimiento: 'INGRESO' }
            });

            // Agregaciones de egresos
            const egresosResult = await this.prisma.transaccion.aggregate({
                _sum: { monto_moneda_base: true },
                _count: { id: true },
                where: { ...whereTransacciones, tipo_movimiento: 'EGRESO' }
            });

            const total_ingresos = ingresosResult._sum.monto_moneda_base || 0;
            const total_egresos = egresosResult._sum.monto_moneda_base || 0;
            const cantidad_ingresos = ingresosResult._count.id || 0;
            const cantidad_egresos = egresosResult._count.id || 0;
            const flujo_neto = total_ingresos - total_egresos;

            // Agrupación por método de pago (solo ingresos)
            const agrupacionMetodos = await this.prisma.transaccion.groupBy({
                by: ['metodo_pago'],
                _sum: { monto_moneda_base: true },
                where: { ...whereTransacciones, tipo_movimiento: 'INGRESO' }
            });

            const por_metodo_pago: MetodoPagoKPI[] = agrupacionMetodos.map(item => {
                const total = item._sum.monto_moneda_base || 0;
                return {
                    metodo: item.metodo_pago || 'OTRO',
                    total,
                    porcentaje: total_ingresos > 0 ? (total / total_ingresos) * 100 : 0
                };
            }).sort((a, b) => b.total - a.total); // Ordenar de mayor a menor

            // Agrupación por origen (solo ingresos)
            const agrupacionOrigen = await this.prisma.transaccion.groupBy({
                by: ['origen_tipo'],
                _sum: { monto_moneda_base: true },
                where: { ...whereTransacciones, tipo_movimiento: 'INGRESO' }
            });

            const por_origen: OrigenDineroKPI[] = agrupacionOrigen.map(item => {
                const total = item._sum.monto_moneda_base || 0;
                return {
                    origen: item.origen_tipo || 'OTRO',
                    total,
                    porcentaje: total_ingresos > 0 ? (total / total_ingresos) * 100 : 0
                };
            }).sort((a, b) => b.total - a.total);

            // Obtener saldo actual de cajas y cuentas
            const whereEntidades: any = { negocio_id: filtros.negocio_id };
            if (filtros.sucursal_ids.length > 0) {
                whereEntidades.sucursal_id = { in: filtros.sucursal_ids };
            }

            const cajasDB = await this.prisma.caja.findMany({
                where: whereEntidades,
                select: { id: true, nombre: true, saldo: true }
            });

            const whereCuentas: any = { negocio_id: filtros.negocio_id };
            if (filtros.sucursal_ids.length > 0) {
                whereCuentas.sucursales = {
                    some: {
                        sucursal_id: { in: filtros.sucursal_ids }
                    }
                };
            }

            const cuentasDB = await this.prisma.cuentaBancaria.findMany({
                where: whereCuentas,
                select: {
                    id: true,
                    numero_cuenta: true,
                    nombre_titular: true,
                    saldo: true,
                    saldo_moneda_base: true,
                    banco: { select: { nombre_comercial: true } },
                    moneda: { select: { codigo: true } }
                }
            });

            const cajas: CajaKPI[] = cajasDB.map(c => ({
                id: c.id,
                nombre: c.nombre,
                saldo: c.saldo
            }));

            const cuentas: CuentaBancariaKPI[] = cuentasDB.map(c => {
                const saldoEnBase = c.saldo_moneda_base ?? c.saldo;
                return {
                    id: c.id,
                    banco: c.banco.nombre_comercial,
                    numero_cuenta: c.numero_cuenta,
                    moneda_codigo: c.moneda?.codigo || 'BASE',
                    saldo: saldoEnBase, // Usamos el saldo guardado ya en moneda base
                    saldo_original: c.saldo, // El saldo en la moneda original de la cuenta
                    tasa_cambio: c.saldo > 0 ? (saldoEnBase / c.saldo) : 1.0 // Tasa histórica deducida
                };
            });

            const saldo_actual = cajas.reduce((acc, c) => acc + c.saldo, 0) +
                cuentas.reduce((acc, c) => acc + c.saldo, 0);

            // En un futuro, el saldo esperado debería partir de un saldo inicial + flujo_neto
            // Por simplicidad del requerimiento, comparamos contra el flujo de caja del periodo
            // Si no hay filtro de fechas, el flujo_neto debería ser ~ saldo_actual
            const saldo_esperado = flujo_neto;

            return {
                kpis: {
                    total_ingresos,
                    total_egresos,
                    flujo_neto,
                    cantidad_ingresos,
                    cantidad_egresos,
                    total_movimientos: cantidad_ingresos + cantidad_egresos
                },
                distribucion: {
                    por_metodo_pago,
                    por_origen,
                    entidades: {
                        cajas,
                        cuentas
                    }
                },
                conciliacion: {
                    saldo_esperado,
                    saldo_actual,
                    diferencia: saldo_actual - saldo_esperado
                }
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
