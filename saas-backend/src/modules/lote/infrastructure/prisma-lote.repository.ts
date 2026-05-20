import type { PrismaClient } from '@prisma/client';
import { PrismaErrorMapper } from '@shared/database/prisma/PrismaErrorMapper.js';
import type { LoteCrear, LoteDetalle } from '../domain/lote.entity.js';
import type { LoteRepository } from '../domain/lote.repository.js';
import { LoteMapper } from './mappers/lote.mapper.js';

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
        } catch (error) {
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
        } catch (error) {
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
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async listarPorProducto(producto_id: string, negocio_id: string, pagination: { page: number, perPage: number }): Promise<any> {
        try {
            const [data, total] = await Promise.all([
                this.prisma.lote.findMany({
                    where: { producto_id, negocio_id, activo: true },
                    orderBy: { fecha_ingreso: 'desc' },
                    skip: (pagination.page - 1) * pagination.perPage,
                    take: pagination.perPage,
                    include: {
                        producto: { select: { id: true, nombre: true } },
                        sucursal: { select: { id: true, nombre: true } },
                    },
                }),
                this.prisma.lote.count({ where: { producto_id, negocio_id, activo: true } })
            ]);

            return {
                total,
                data: data.map((d: any) => LoteMapper.mapDetalle(d))
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
