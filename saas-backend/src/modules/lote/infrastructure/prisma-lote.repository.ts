import type { PrismaClient } from '@prisma/client';
import { PrismaErrorMapper } from '@shared/database/prisma/PrismaErrorMapper.js';
import type { LoteCrear, LoteDetalle } from '../domain/lote.entity.js';
import type { LoteRepository } from '../domain/lote.repository.js';
import { LoteMapper } from './mappers/lote.mapper.js';
import { LoteNotFoundPersistenceError } from '../../../shared/database/errors/LoteNotFoundPersistenceError.js';
import { InsufficientStockPersistenceError } from '../../../shared/database/errors/InsufficientStockPersistenceError.js';
import { PersistenceError } from '../../../shared/database/errors/PersistenceError.js';

export class PrismaLoteRepository implements LoteRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async registrar(lote: LoteCrear, negocio_id: string): Promise<LoteDetalle> {
        try {
            const fecha_vencimiento = lote.fecha_vencimiento
                ? new Date(lote.fecha_vencimiento)
                : null;

            const createPayload: any = {
                ...lote,
                negocio_id,
                codigo_lote: lote.codigo_lote!,
            };

            if (fecha_vencimiento && !Number.isNaN(fecha_vencimiento.getTime())) {
                createPayload.fecha_vencimiento = fecha_vencimiento;
            } else {
                delete createPayload.fecha_vencimiento;
            }

            const created = await this.prisma.lote.create({
                data: createPayload,
                include: {
                    variante: { select: { id: true, sku: true, producto_id: true, producto: { select: { id: true, nombre: true } } } },
                    sucursal: { select: { id: true, nombre: true } },
                },
            });

            return LoteMapper.mapDetalle(created as any);
        } catch (error: any) {
            if (error instanceof PersistenceError) throw error;
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtener(id: string, negocio_id: string): Promise<LoteDetalle | null> {
        try {
            const found = await this.prisma.lote.findFirst({
                where: { id, negocio_id },
                include: {
                    variante: { select: { id: true, sku: true, producto_id: true, producto: { select: { id: true, nombre: true } } } },
                    sucursal: { select: { id: true, nombre: true } },
                },
            });
            return found ? LoteMapper.mapDetalle(found as any) : null;
        } catch (error: any) {
            if (error instanceof PersistenceError) throw error;
            throw PrismaErrorMapper.map(error);
        }
    }

    async listar(negocio_id: string, sucursal_id: string, pagination: { page: number, perPage: number }, filters: Record<string, any> = {}): Promise<any> {
        try {
            const { page, perPage } = pagination;
            const offset = (page - 1) * perPage;

            const where: any = { negocio_id, activo: true };
            if (sucursal_id) where.sucursal_id = sucursal_id;

            // Apply filters
            if (filters.q) {
                where.OR = [
                    { codigo_lote: { contains: filters.q } },
                    { variante: { producto: { nombre: { contains: filters.q } } } },
                    { variante: { sku: { contains: filters.q } } }
                ];
            }

            if (filters.codigo_lote) {
                where.codigo_lote = { contains: filters.codigo_lote };
            }

            if (filters.producto_codigo) {
                where.variante = { ...(where.variante ?? {}), producto: { codigo: { contains: filters.producto_codigo } } };
            }

            if (filters.codigo_secuencial) {
                where.variante = { ...(where.variante ?? {}), codigo_secuencial: { contains: filters.codigo_secuencial } };
            }

            if (filters.fecha_vencimiento_from || filters.fecha_vencimiento_to) {
                where.fecha_vencimiento = {} as any;
                if (filters.fecha_vencimiento_from) where.fecha_vencimiento.gte = new Date(filters.fecha_vencimiento_from);
                if (filters.fecha_vencimiento_to) where.fecha_vencimiento.lte = new Date(filters.fecha_vencimiento_to);
            }

            if (filters.created_at_from || filters.created_at_to) {
                where.created_at = {} as any;
                if (filters.created_at_from) where.created_at.gte = new Date(filters.created_at_from);
                if (filters.created_at_to) where.created_at.lte = new Date(filters.created_at_to);
            }

            const [total, data] = await Promise.all([
                this.prisma.lote.count({ where }),
                this.prisma.lote.findMany({
                    where,
                    orderBy: { fecha_ingreso: 'desc' },
                    skip: offset,
                    take: perPage,
                    include: {
                        variante: { select: { id: true, sku: true, codigo_secuencial: true, producto_id: true, producto: { select: { id: true, nombre: true, codigo: true } } } },
                        sucursal: { select: { id: true, nombre: true } },
                    },
                })
            ]);

            return {
                total,
                data: data.map((d: any) => LoteMapper.mapDetalle(d)),
                page,
                perPage
            };
        } catch (error: any) {
            if (error instanceof PersistenceError) throw error;
            throw PrismaErrorMapper.map(error);
        }
    }

    async listarPorVariante(variante_id: string, negocio_id: string, pagination: { page: number, perPage: number }, sucursal_id?: string): Promise<any> {
        try {
            const { page, perPage } = pagination;
            const offset = (page - 1) * perPage;
            const where: any = { negocio_id, activo: true };

            if (sucursal_id) where.sucursal_id = sucursal_id;
            if (variante_id) where.variante_id = variante_id;

            const [total, data] = await Promise.all([
                this.prisma.lote.count({ where }),
                this.prisma.lote.findMany({
                    where,
                    orderBy: { fecha_ingreso: 'asc' },
                    skip: offset,
                    take: perPage,
                    include: {
                        variante: { select: { id: true, sku: true, producto_id: true, producto: { select: { id: true, nombre: true } } } },
                        sucursal: { select: { id: true, nombre: true } },
                    },
                })
            ]);

            const mappedData = data.map((d: any) => LoteMapper.mapDetalle(d));
            const stock = mappedData.reduce((sum, lote) => sum + (lote.cantidad_actual ?? 0), 0);

            return {
                total,
                data: mappedData,
                stock,
                page,
                perPage
            };
        } catch (error: any) {
            if (error instanceof PersistenceError) throw error;
            throw PrismaErrorMapper.map(error);
        }
    }

    async listarPorProducto(producto_id: string, negocio_id: string, pagination: { page: number, perPage: number }, sucursal_id?: string): Promise<any> {
        try {
            const { page, perPage } = pagination;
            const offset = (page - 1) * perPage;
            const where: any = {
                negocio_id,
                activo: true,
                variante: { producto_id },
            };

            if (sucursal_id) where.sucursal_id = sucursal_id;

            const [total, data] = await Promise.all([
                this.prisma.lote.count({ where }),
                this.prisma.lote.findMany({
                    where,
                    orderBy: { fecha_ingreso: 'asc' },
                    skip: offset,
                    take: perPage,
                    include: {
                        variante: { select: { id: true, sku: true, producto_id: true, producto: { select: { id: true, nombre: true } } } },
                        sucursal: { select: { id: true, nombre: true } },
                    },
                })
            ]);

            return {
                total,
                data: data.map((d: any) => LoteMapper.mapDetalle(d))
            };
        } catch (error: any) {
            if (error instanceof PersistenceError) throw error;
            throw PrismaErrorMapper.map(error);
        }
    }

    async disminuirCantidad(id: string, negocio_id: string, cantidad: number): Promise<void> {
        try {
            const lote = await this.prisma.lote.findFirst({ where: { id, negocio_id } });
            if (!lote) throw new LoteNotFoundPersistenceError();
            const actual = lote.cantidad_actual ?? 0;
            if (actual < cantidad) throw new InsufficientStockPersistenceError();
            const nueva = actual - cantidad;
            await this.prisma.lote.update({ where: { id }, data: { cantidad_actual: nueva, activo: nueva > 0 } });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
