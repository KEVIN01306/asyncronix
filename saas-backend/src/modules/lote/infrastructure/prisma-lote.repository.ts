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
            const created = await this.prisma.lote.create({
                data: {
                    ...lote,
                    negocio_id,
                },
                include: {
                    producto: { select: { id: true, nombre: true } },
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
                    producto: { select: { id: true, nombre: true } },
                    sucursal: { select: { id: true, nombre: true } },
                },
            });
            return found ? LoteMapper.mapDetalle(found as any) : null;
        } catch (error: any) {
            if (error instanceof PersistenceError) throw error;
            throw PrismaErrorMapper.map(error);
        }
    }

    async listar(negocio_id: string, pagination: { page: number, perPage: number }): Promise<any> {
        try {
            const [data, total] = await Promise.all([
                this.prisma.lote.findMany({
                    where: { negocio_id, activo: true },
                    orderBy: { fecha_ingreso: 'desc' },
                    skip: (pagination.page - 1) * pagination.perPage,
                    take: pagination.perPage,
                    include: {
                        producto: { select: { id: true, nombre: true } },
                        sucursal: { select: { id: true, nombre: true } },
                    },
                }),
                this.prisma.lote.count({ where: { negocio_id, activo: true } })
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

    async listarPorProducto(producto_id: string, negocio_id: string, pagination: { page: number, perPage: number }, sucursal_id?: string): Promise<any> {
        try {
            const where: any = { producto_id, negocio_id, activo: true };
            if (sucursal_id) where.sucursal_id = sucursal_id;

            const [data, total] = await Promise.all([
                this.prisma.lote.findMany({
                    where,
                    // FIFO: consumir lotes por fecha de ingreso ascendente (más antiguos primero)
                    orderBy: { fecha_ingreso: 'asc' },
                    skip: (pagination.page - 1) * pagination.perPage,
                    take: pagination.perPage,
                    include: {
                        producto: { select: { id: true, nombre: true } },
                        sucursal: { select: { id: true, nombre: true } },
                    },
                }),
                this.prisma.lote.count({ where })
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
