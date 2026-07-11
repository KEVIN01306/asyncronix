import type { PrismaClient } from '@prisma/client';
import { PrismaErrorMapper } from '@shared/database/prisma/PrismaErrorMapper.js';
import type { Paginated } from '@shared/domain/paginated.js';
import type { Pagination } from '@shared/domain/pagination.js';
import type {
    Transaccion,
    TransaccionCrear,
    TransaccionCrearDirecta,
    IngresoEgresoEntity,
} from '../domain/transaccion.entity.js';
import type { TransaccionRepository, ListarTransaccionesMovimientosFilters } from '../domain/transaccion.repository.js';
import { TransaccionMapper } from './mappers/transaccion.mapper.js';

// Shared Prisma include used for both list and detail queries to ensure a
// consistent shape that feeds mapIngresoEgreso correctly.
const INGRESO_EGRESO_INCLUDE = {
    categoria: {
        select: { id: true, nombre: true },
    },
    usuario: {
        select: { id: true, nombre: true, apellido: true, avatar_url: true },
    },
    moneda: {
        select: { id: true, codigo: true, nombre: true, simbolo: true },
    },
    moneda_actual: {
        select: { id: true, codigo: true, nombre: true, simbolo: true },
    },
    origen_caja: {
        select: { id: true, nombre: true },
    },
    origen_cuenta: {
        select: {
            id: true,
            numero_cuenta: true,
            nombre_titular: true,
            banco: { select: { nombre_comercial: true } },
            moneda: { select: { codigo: true } },
        },
    },
    destino_caja: {
        select: { id: true, nombre: true },
    },
    destino_cuenta: {
        select: {
            id: true,
            numero_cuenta: true,
            nombre_titular: true,
            banco: { select: { nombre_comercial: true } },
            moneda: { select: { codigo: true } },
        },
    },
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Calculates the next correlativo for a business by fetching the max
 * correlativo from the transacciones table and adding 1.
 */
async function obtenerSiguienteCorrelativo(prisma: PrismaClient, negocio_id: string): Promise<number> {
    const ultima = await (prisma as any).transaccion.findFirst({
        where: { negocio_id },
        orderBy: { correlativo: 'desc' },
        select: { correlativo: true },
    });
    return ultima ? ultima.correlativo + 1 : 1;
}

/**
 * Builds the transaction code from the business name and correlativo.
 * Format: first 4 letters of name (uppercase) + correlativo padded to at least 9 digits.
 * Example: "PATRON" + 1 → "PATR000000001"
 */
function generarCodigo(nombreNegocio: string, correlativo: number): string {
    const prefix = nombreNegocio.replace(/\s+/g, '').toUpperCase().slice(0, 4).padEnd(4, 'X');
    const numero = String(correlativo).padStart(9, '0');
    return `${prefix}${numero}`;
}

export class PrismaTransaccionRepository implements TransaccionRepository {
    constructor(private readonly prisma: PrismaClient) { }

    // ── Generic low-level creator ─────────────────────────────────────────────

    async crearTransaccion(data: TransaccionCrearDirecta): Promise<Transaccion> {
        try {
            // Obtain the business name for code generation
            const negocio = await (this.prisma as any).negocio.findUnique({
                where: { id: data.negocio_id },
                select: { nombre: true },
            });
            const nombreNegocio: string = negocio?.nombre ?? 'XXXX';

            const correlativo = await obtenerSiguienteCorrelativo(this.prisma as any, data.negocio_id);
            const codigo = generarCodigo(nombreNegocio, correlativo);

            const created = await this.prisma.transaccion.create({
                data: {
                    negocio_id: data.negocio_id,
                    sucursal_id: data.sucursal_id,
                    usuario_id: data.usuario_id,
                    categoria_id: data.categoria_id ?? null,
                    correlativo,
                    codigo,
                    tipo_movimiento: data.tipo_movimiento as any,
                    origen_tipo: data.origen_tipo as any,
                    moneda_id: data.moneda_id,
                    moneda_actual_id: data.moneda_actual_id ?? null,
                    monto_original: data.monto_original,
                    tipo_cambio: data.tipo_cambio,
                    monto_moneda_base: data.monto_moneda_base,
                    descripcion: data.descripcion ?? null,
                    origen_entidad: (data.origen_entidad ?? null) as any,
                    origen_caja_id: data.origen_caja_id ?? null,
                    origen_cuenta_id: data.origen_cuenta_id ?? null,
                    destino_entidad: (data.destino_entidad ?? null) as any,
                    destino_caja_id: data.destino_caja_id ?? null,
                    destino_cuenta_id: data.destino_cuenta_id ?? null,
                    fecha_transaccion: data.fecha_transaccion ?? new Date(),
                },
            });

            return {
                id: created.id,
                negocio_id: created.negocio_id,
                sucursal_id: created.sucursal_id,
                categoria_id: created.categoria_id,
                usuario_id: created.usuario_id,
                correlativo: created.correlativo,
                codigo: created.codigo,
                tipo_movimiento: created.tipo_movimiento as any,
                origen_tipo: created.origen_tipo as any,
                moneda_id: created.moneda_id,
                moneda_actual_id: created.moneda_actual_id,
                monto_original: created.monto_original,
                tipo_cambio: created.tipo_cambio,
                monto_moneda_base: created.monto_moneda_base,
                descripcion: created.descripcion,
                origen_entidad: created.origen_entidad as any,
                origen_caja_id: created.origen_caja_id,
                origen_cuenta_id: created.origen_cuenta_id,
                destino_entidad: created.destino_entidad as any,
                destino_caja_id: created.destino_caja_id,
                destino_cuenta_id: created.destino_cuenta_id,
                fecha_transaccion: created.fecha_transaccion,
                created_at: created.created_at,
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    // ── Ingresos-Egresos module ───────────────────────────────────────────────

    async crearMovimiento(
        data: TransaccionCrear,
        negocio_id: string,
        sucursal_id: string,
        usuario_id: string
    ): Promise<IngresoEgresoEntity> {
        try {
            // Resolve origin / destination based on movement type.
            // INGRESO  → funds arrive  → destino fields
            // EGRESO   → funds leave   → origen fields
            let origen_entidad = null;
            let origen_caja_id = null;
            let origen_cuenta_id = null;
            let destino_entidad = null;
            let destino_caja_id = null;
            let destino_cuenta_id = null;

            if (data.tipo_movimiento === 'EGRESO') {
                origen_entidad = data.entidad_tipo;
                if (data.entidad_tipo === 'CAJA') {
                    origen_caja_id = data.entidad_id;
                } else {
                    origen_cuenta_id = data.entidad_id;
                }
            } else if (data.tipo_movimiento === 'INGRESO') {
                destino_entidad = data.entidad_tipo;
                if (data.entidad_tipo === 'CAJA') {
                    destino_caja_id = data.entidad_id;
                } else {
                    destino_cuenta_id = data.entidad_id;
                }
            }

            // Obtain business name + generate correlativo and codigo
            const negocio = await (this.prisma as any).negocio.findUnique({
                where: { id: negocio_id },
                select: { nombre: true },
            });
            const nombreNegocio: string = negocio?.nombre ?? 'XXXX';

            const correlativo = await obtenerSiguienteCorrelativo(this.prisma as any, negocio_id);
            const codigo = generarCodigo(nombreNegocio, correlativo);

            const created = await this.prisma.transaccion.create({
                data: {
                    negocio_id,
                    sucursal_id,
                    categoria_id: data.categoria_id,
                    usuario_id,
                    correlativo,
                    codigo,
                    tipo_movimiento: data.tipo_movimiento as any,
                    origen_tipo: 'INGRESO_EGRESO',
                    moneda_id: data.moneda_id!,
                    moneda_actual_id: data.moneda_actual_id ?? null,
                    monto_original: data.monto_original,
                    tipo_cambio: data.tipo_cambio || 1.0,
                    monto_moneda_base: data.monto_moneda_base || data.monto_original,
                    descripcion: data.descripcion || null,
                    origen_entidad: origen_entidad as any,
                    origen_caja_id,
                    origen_cuenta_id,
                    destino_entidad: destino_entidad as any,
                    destino_caja_id,
                    destino_cuenta_id,
                    fecha_transaccion: data.fecha_transaccion || new Date(),
                },
                include: INGRESO_EGRESO_INCLUDE,
            });

            return TransaccionMapper.mapIngresoEgreso(created);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtenerDetalle(
        id: string,
        negocio_id: string,
        sucursal_id: string
    ): Promise<IngresoEgresoEntity | null> {
        try {
            const found = await this.prisma.transaccion.findFirst({
                where: {
                    id,
                    negocio_id,
                    sucursal_id,
                    origen_tipo: 'INGRESO_EGRESO',
                },
                include: INGRESO_EGRESO_INCLUDE,
            });

            return found ? TransaccionMapper.mapIngresoEgreso(found) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async listarMovimientos(
        negocio_id: string,
        sucursal_id: string,
        pagination: Pagination,
        filters?: ListarTransaccionesMovimientosFilters
    ): Promise<Paginated<IngresoEgresoEntity>> {
        try {
            const skip = (pagination.page - 1) * pagination.perPage;
            const take = pagination.perPage;

            const whereCondition: any = {
                negocio_id,
                sucursal_id,
                origen_tipo: 'INGRESO_EGRESO',
            };

            if (filters?.tipo_movimiento) {
                whereCondition.tipo_movimiento = filters.tipo_movimiento;
            }

            if (filters?.categoria_id) {
                whereCondition.categoria_id = filters.categoria_id;
            }

            if (filters?.entidad_tipo && filters?.entidad_id) {
                if (filters.entidad_tipo === 'CAJA') {
                    whereCondition.OR = [
                        { origen_caja_id: filters.entidad_id },
                        { destino_caja_id: filters.entidad_id },
                    ];
                } else if (filters.entidad_tipo === 'CUENTA') {
                    whereCondition.OR = [
                        { origen_cuenta_id: filters.entidad_id },
                        { destino_cuenta_id: filters.entidad_id },
                    ];
                }
            }

            if (filters?.fecha_inicio || filters?.fecha_fin) {
                whereCondition.fecha_transaccion = {};
                if (filters.fecha_inicio) {
                    whereCondition.fecha_transaccion.gte = filters.fecha_inicio;
                }
                if (filters.fecha_fin) {
                    const endOfDay = new Date(filters.fecha_fin);
                    endOfDay.setHours(23, 59, 59, 999);
                    whereCondition.fecha_transaccion.lte = endOfDay;
                }
            }

            if (filters?.q) {
                whereCondition.OR = [
                    { descripcion: { contains: filters.q } },
                    { categoria: { nombre: { contains: filters.q } } },
                    { codigo: { contains: filters.q } }
                ];
            }

            const [total, data] = await Promise.all([
                this.prisma.transaccion.count({ where: whereCondition }),
                this.prisma.transaccion.findMany({
                    where: whereCondition,
                    skip,
                    take,
                    orderBy: { fecha_transaccion: 'desc' },
                    include: INGRESO_EGRESO_INCLUDE,
                }),
            ]);

            return {
                page: pagination.page,
                perPage: pagination.perPage,
                total,
                data: data.map((item) => TransaccionMapper.mapIngresoEgreso(item)),
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
