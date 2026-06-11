import type { PrismaClient } from '@prisma/client';
import { PrismaErrorMapper } from '@shared/database/prisma/PrismaErrorMapper.js';
import type { Paginated } from '@shared/domain/paginated.js';
import type { Pagination } from '@shared/domain/pagination.js';
import type { TrasladoCrear, TrasladoDetalle } from '../domain/traslado.entity.js';
import type { TrasladoRepository } from '../domain/traslado.repository.js';
import { TrasladoMapper } from './mappers/traslado.mapper.js';
import { LoteNotFoundPersistenceError } from '@shared/database/errors/LoteNotFoundPersistenceError.js';
import { InsufficientStockPersistenceError } from '@shared/database/errors/InsufficientStockPersistenceError.js';
import { PersistenceError } from '@shared/database/errors/PersistenceError.js';
import { NotFoundPersistenceError } from '@shared/database/errors/NotFoundPersistenceError.js';
import { InvalidTrasladoStatePersistenceError } from '@shared/database/errors/InvalidTrasladoStatePersistenceError.js';

export class PrismaTrasladoRepository implements TrasladoRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async registrar(data: TrasladoCrear, negocio_id: string, creador_id: string, origen_id: string): Promise<TrasladoDetalle> {
        try {
            const loteIds = data.detalles.map(detalle => detalle.lote_id);
            const lotes = await this.prisma.lote.findMany({
                where: {
                    id: { in: loteIds },
                    negocio_id,
                    sucursal_id: origen_id,
                },
            });

            if (lotes.length !== loteIds.length) {
                throw new LoteNotFoundPersistenceError();
            }

            const cantidadPorLote = new Map<string, number>();
            lotes.forEach((lote) => cantidadPorLote.set(lote.id, lote.cantidad_actual ?? 0));
            for (const detalle of data.detalles) {
                const actual = cantidadPorLote.get(detalle.lote_id) ?? 0;
                if (actual < detalle.cantidad) {
                    throw new InsufficientStockPersistenceError();
                }
            }

            const traslado = await this.prisma.$transaction(async (tx) => {
                const destino = await tx.sucursal.findFirst({
                    where: {
                        id: data.sucursal_destino_id,
                        negocio_id,
                    },
                });

                if (!destino) {
                    throw new NotFoundPersistenceError();
                }

                const created = await tx.traslado.create({
                    data: {
                        origen_id,
                        destino_id: data.sucursal_destino_id,
                        creador_id,
                        estado: 'PENDIENTE',
                        detalles: {
                            create: data.detalles.map((detalle) => ({
                                lote_id: detalle.lote_id,
                                cantidad: detalle.cantidad,
                            })),
                        },
                    },
                    include: {
                        creador: { select: { id: true, nombre: true, apellido: true } },
                        origen: { select: { id: true, nombre: true, negocio_id: true } },
                        destino: { select: { id: true, nombre: true, negocio_id: true } },
                        detalles: {
                            include: {
                                lote: {
                                    include: {
                                        variante: { select: { id: true, sku: true, producto_id: true, producto: { select: { id: true, nombre: true } } } },
                                        sucursal: { select: { id: true, nombre: true } },
                                    },
                                },
                            },
                        },
                    },
                });

                for (const detalle of data.detalles) {
                    const actual = cantidadPorLote.get(detalle.lote_id) ?? 0;
                    const nuevaCantidad = actual - detalle.cantidad;
                    await tx.lote.update({
                        where: { id: detalle.lote_id },
                        data: { cantidad_actual: nuevaCantidad, activo: nuevaCantidad > 0 },
                    });
                }

                return created;
            },{
                timeout: 10000
            });

            return TrasladoMapper.mapDetalle(traslado as any);
        } catch (error: any) {
            if (error instanceof PersistenceError) throw error;
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtener(id: string, negocio_id: string): Promise<TrasladoDetalle | null> {
        try {
            const traslado = await this.prisma.traslado.findFirst({
                where: {
                    id,
                    origen: { negocio_id },
                    destino: { negocio_id },
                },
                include: {
                    creador: { select: { id: true, nombre: true, apellido: true } },
                    origen: { select: { id: true, nombre: true } },
                    destino: { select: { id: true, nombre: true } },
                    detalles: {
                        include: {
                            lote: {
                                include: {
                                    variante: { select: { id: true, sku: true, producto_id: true, producto: { select: { id: true, nombre: true } } } },
                                    sucursal: { select: { id: true, nombre: true } },
                                },
                            },
                        },
                    },
                },
            });

            return traslado ? TrasladoMapper.mapDetalle(traslado as any) : null;
        } catch (error: any) {
            if (error instanceof PersistenceError) throw error;
            throw PrismaErrorMapper.map(error);
        }
    }

    async listarPorOrigen(negocio_id: string, origen_id: string, pagination: Pagination): Promise<Paginated<TrasladoDetalle>> {
        try {
            const { page, perPage } = pagination;
            const offset = (page - 1) * perPage;
            const where = {
                origen_id,
                origen: { negocio_id },
                destino: { negocio_id },
            };

            const [total, traslados] = await Promise.all([
                this.prisma.traslado.count({ where }),
                this.prisma.traslado.findMany({
                    where,
                    orderBy: { created_at: 'desc' },
                    skip: offset,
                    take: perPage,
                    include: {
                        creador: { select: { id: true, nombre: true, apellido: true } },
                        origen: { select: { id: true, nombre: true } },
                        destino: { select: { id: true, nombre: true } },
                        detalles: {
                            include: {
                                lote: {
                                    include: {
                                        variante: { select: { id: true, sku: true, producto_id: true, producto: { select: { id: true, nombre: true } } } },
                                        sucursal: { select: { id: true, nombre: true } },
                                    },
                                },
                            },
                        },
                    },
                }),
            ]);

            return {
                total,
                data: traslados.map((traslado) => TrasladoMapper.mapDetalle(traslado as any)),
                page,
                perPage,
            };
        } catch (error: any) {
            if (error instanceof PersistenceError) throw error;
            throw PrismaErrorMapper.map(error);
        }
    }

    async listarPorDestino(negocio_id: string, destino_id: string, pagination: Pagination): Promise<Paginated<TrasladoDetalle>> {
        try {
            const { page, perPage } = pagination;
            const offset = (page - 1) * perPage;
            const where = {
                destino_id,
                origen: { negocio_id },
                destino: { negocio_id },
            };

            const [total, traslados] = await Promise.all([
                this.prisma.traslado.count({ where }),
                this.prisma.traslado.findMany({
                    where,
                    orderBy: { created_at: 'desc' },
                    skip: offset,
                    take: perPage,
                    include: {
                        creador: { select: { id: true, nombre: true, apellido: true } },
                        origen: { select: { id: true, nombre: true } },
                        destino: { select: { id: true, nombre: true } },
                        detalles: {
                            include: {
                                lote: {
                                    include: {
                                        variante: { select: { id: true, sku: true, producto_id: true, producto: { select: { id: true, nombre: true } } } },
                                        sucursal: { select: { id: true, nombre: true } },
                                    },
                                },
                            },
                        },
                    },
                }),
            ]);

            return {
                total,
                data: traslados.map((traslado) => TrasladoMapper.mapDetalle(traslado as any)),
                page,
                perPage,
            };
        } catch (error: any) {
            if (error instanceof PersistenceError) throw error;
            throw PrismaErrorMapper.map(error);
        }
    }

    async cancelar(id: string, negocio_id: string, origen_id: string): Promise<void> {
        try {
            await this.prisma.$transaction(async (tx) => {
                const traslado = await tx.traslado.findFirst({
                    where: {
                        id,
                        origen_id,
                        origen: { negocio_id },
                    },
                    include: {
                        detalles: true,
                    },
                });

                if (!traslado) {
                    throw new NotFoundPersistenceError();
                }

                if (traslado.estado !== 'PENDIENTE') {
                    throw new InvalidTrasladoStatePersistenceError();
                }

                for (const detalle of traslado.detalles) {
                    const lote = await tx.lote.findUnique({ where: { id: detalle.lote_id } });
                    if (!lote) {
                        throw new LoteNotFoundPersistenceError();
                    }
                    const nuevaCantidad = (lote.cantidad_actual ?? 0) + detalle.cantidad;
                    await tx.lote.update({
                        where: { id: lote.id },
                        data: { cantidad_actual: nuevaCantidad, activo: true },
                    });
                }

                await tx.traslado.update({
                    where: { id },
                    data: { estado: 'CANCELADO' },
                });
            });
        } catch (error: any) {
            if (error instanceof PersistenceError) throw error;
            throw PrismaErrorMapper.map(error);
        }
    }

    async recibir(id: string, negocio_id: string, destino_id: string): Promise<void> {
        try {
            await this.prisma.$transaction(async (tx) => {
                const traslado = await tx.traslado.findFirst({
                    where: {
                        id,
                        destino_id,
                        destino: { negocio_id },
                    },
                    include: {
                        detalles: {
                            include: {
                                lote: {
                                    include: {
                                        variante: true,
                                        sucursal: true,
                                    },
                                },
                            },
                        },
                    },
                });

                if (!traslado) {
                    throw new NotFoundPersistenceError();
                }

                if (traslado.estado !== 'PENDIENTE') {
                    throw new InvalidTrasladoStatePersistenceError();
                }

                for (const detalle of traslado.detalles) {
                    const origenLote = detalle.lote;
                    if (!origenLote) {
                        throw new LoteNotFoundPersistenceError();
                    }

                    const existingDestinoLote = await tx.lote.findFirst({
                        where: {
                            sucursal_id: destino_id,
                            variante_id: origenLote.variante_id,
                            proveedor_id: origenLote.proveedor_id,
                            costo_compra: origenLote.costo_compra,
                            precio_venta: origenLote.precio_venta,
                            fecha_vencimiento: origenLote.fecha_vencimiento,
                            activo: true,
                        },
                    });

                    if (existingDestinoLote) {
                        await tx.lote.update({
                            where: { id: existingDestinoLote.id },
                            data: {
                                cantidad_actual: (existingDestinoLote.cantidad_actual ?? 0) + detalle.cantidad,
                                activo: true,
                            },
                        });
                    } else {
                        await tx.lote.create({
                            data: {
                                negocio_id,
                                sucursal_id: destino_id,
                                variante_id: origenLote.variante_id,
                                proveedor_id: origenLote.proveedor_id,
                                codigo_lote: origenLote.codigo_lote,
                                cantidad_inicial: detalle.cantidad,
                                cantidad_actual: detalle.cantidad,
                                costo_compra: origenLote.costo_compra,
                                precio_venta: origenLote.precio_venta,
                                fecha_ingreso: new Date(),
                                fecha_vencimiento: origenLote.fecha_vencimiento,
                                activo: true,
                            },
                        });
                    }
                }

                await tx.traslado.update({
                    where: { id },
                    data: { estado: 'COMPLETADO' },
                });
            },{
                timeout: 10000
            });
        } catch (error: any) {
            if (error instanceof PersistenceError) throw error;
            throw PrismaErrorMapper.map(error);
        }
    }
}
