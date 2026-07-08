import type { PrismaClient } from '@prisma/client';
import { PrismaErrorMapper } from '@shared/database/prisma/PrismaErrorMapper.js';
import type { Paginated } from '@shared/domain/paginated.js';
import type { Pagination } from '@shared/domain/pagination.js';
import type { TransaccionCrear, TransaccionDetalle, TransaccionSimple } from '../domain/transaccion.entity.js';
import type { TransaccionRepository, ListarTransaccionesMovimientosFilters } from '../domain/transaccion.repository.js';
import { TransaccionMapper } from './mappers/transaccion.mapper.js';

export class PrismaTransaccionRepository implements TransaccionRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async crearMovimiento(
        data: TransaccionCrear,
        negocio_id: string,
        sucursal_id: string,
        usuario_id: string
    ): Promise<TransaccionDetalle> {
        try {
            let origen_entidad = null;
            let origen_caja_id = null;
            let origen_cuenta_id = null;
            let destino_entidad = null;
            let destino_caja_id = null;
            let destino_cuenta_id = null;

            // Asignar origen o destino según el tipo de movimiento
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

            const created = await this.prisma.transaccion.create({
                data: {
                    negocio_id,
                    sucursal_id,
                    categoria_id: data.categoria_id,
                    usuario_id,
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
                include: {
                    categoria: {
                        select: { id: true, nombre: true },
                    },
                    usuario: {
                        select: { id: true, nombre: true },
                    },
                    moneda: {
                        select: { id: true, codigo: true, nombre: true, simbolo: true },
                    },
                    moneda_actual: {
                        select: { id: true, codigo: true, nombre: true, simbolo: true },
                    },
                    negocio: {
                        select: { moneda_id: true },
                    },
                    origen_caja: {
                        select: { id: true, nombre: true },
                    },
                    origen_cuenta: {
                        select: {
                            id: true,
                            numero_cuenta: true,
                            nombre_titular: true,
                            banco: {
                                select: { nombre_comercial: true },
                            },
                            moneda: {
                                select: { codigo: true },
                            },
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
                            banco: {
                                select: { nombre_comercial: true },
                            },
                            moneda: {
                                select: { codigo: true },
                            },
                        },
                    },
                },
            });

            return TransaccionMapper.mapDetalle(created);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtenerDetalle(
        id: string,
        negocio_id: string,
        sucursal_id: string
    ): Promise<TransaccionDetalle | null> {
        try {
            const found = await this.prisma.transaccion.findFirst({
                where: {
                    id,
                    negocio_id,
                    sucursal_id,
                    origen_tipo: 'INGRESO_EGRESO',
                },
                include: {
                    categoria: {
                        select: { id: true, nombre: true },
                    },
                    usuario: {
                        select: { id: true, nombre: true },
                    },
                    moneda: {
                        select: { id: true, codigo: true, nombre: true, simbolo: true },
                    },
                    moneda_actual: {
                        select: { id: true, codigo: true, nombre: true, simbolo: true },
                    },
                    negocio: {
                        select: { moneda_id: true },
                    },
                    origen_caja: {
                        select: { id: true, nombre: true },
                    },
                    origen_cuenta: {
                        select: {
                            id: true,
                            numero_cuenta: true,
                            nombre_titular: true,
                            banco: {
                                select: { nombre_comercial: true },
                            },
                            moneda: {
                                select: { codigo: true },
                            },
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
                            banco: {
                                select: { nombre_comercial: true },
                            },
                            moneda: {
                                select: { codigo: true },
                            },
                        },
                    },
                },
            });

            return found ? TransaccionMapper.mapDetalle(found) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async listarMovimientos(
        negocio_id: string,
        sucursal_id: string,
        pagination: Pagination,
        filters?: ListarTransaccionesMovimientosFilters
    ): Promise<Paginated<TransaccionSimple>> {
        try {
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
                ];
            }

            const [total, data] = await Promise.all([
                this.prisma.transaccion.count({ where: whereCondition }),
                this.prisma.transaccion.findMany({
                    where: whereCondition,
                    skip: pagination.offset,
                    take: pagination.limit,
                    orderBy: { fecha_transaccion: 'desc' },
                    include: {
                        categoria: {
                            select: { nombre: true },
                        },
                        usuario: {
                            select: { nombre: true },
                        },
                        moneda: {
                            select: { codigo: true },
                        },
                        moneda_actual: {
                            select: { codigo: true },
                        },
                        origen_caja: {
                            select: { nombre: true },
                        },
                        origen_cuenta: {
                            select: { numero_cuenta: true },
                        },
                        destino_caja: {
                            select: { nombre: true },
                        },
                        destino_cuenta: {
                            select: { numero_cuenta: true },
                        },
                    },
                }),
            ]);

            return {
                total,
                data: data.map((item) => TransaccionMapper.mapSimple(item)),
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
