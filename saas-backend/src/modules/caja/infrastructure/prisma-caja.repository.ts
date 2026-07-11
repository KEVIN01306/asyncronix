import type { PrismaClient } from '@prisma/client';
import { PrismaErrorMapper } from '@shared/database/prisma/PrismaErrorMapper.js';
import type { Paginated } from '@shared/domain/paginated.js';
import type { CajaActualizar, CajaCrear, CajaObtenidoDetalle, CajaSimple } from '../domain/caja.entity.js';
import type { CajaRepository } from '../domain/caja.repository.js';
import { CajaMapper } from './mappers/caja.mapper.js';
import type { Pagination } from '@shared/domain/pagination.js';

export class PrismaCajaRepository implements CajaRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async registrar(data: CajaCrear, negocio_id: string, sucursal_id: string): Promise<CajaObtenidoDetalle> {
        try {
            const created = await this.prisma.caja.create({
                data: {
                    ...data,
                    negocio_id,
                    sucursal_id,
                },
            });
            return CajaMapper.mapSimple(created as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizar(id: string, negocio_id: string, sucursal_id: string, data: CajaActualizar): Promise<CajaObtenidoDetalle> {
        try {
            const existing = await this.prisma.caja.findFirst({ where: { id, negocio_id, sucursal_id } });
            if (!existing) {
                throw new Error('NOT_FOUND');
            }
            const updated = await this.prisma.caja.update({
                where: { id },
                data,
            });
            return CajaMapper.mapSimple(updated as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizarSaldo(id: string, negocio_id: string, sucursal_id: string, nuevoSaldo: number, options?: { tx?: any }): Promise<CajaObtenidoDetalle> {
        try {
            const db = options?.tx || this.prisma;
            const existing = await db.caja.findFirst({ where: { id, negocio_id, sucursal_id } });
            if (!existing) {
                throw new Error('NOT_FOUND');
            }
            const updated = await db.caja.update({
                where: { id },
                data: { saldo: nuevoSaldo },
            });
            return CajaMapper.mapSimple(updated as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminar(id: string, negocio_id: string, sucursal_id: string): Promise<void> {
        try {
            const existing = await this.prisma.caja.findFirst({ where: { id, negocio_id, sucursal_id } });
            if (!existing) {
                throw new Error('NOT_FOUND');
            }
            await this.prisma.caja.delete({ where: { id } });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtener(id: string, negocio_id: string, sucursal_id: string, options?: { tx?: any }): Promise<CajaObtenidoDetalle | null> {
        try {
            const db = options?.tx || this.prisma;
            const found = await db.caja.findFirst({ where: { id, negocio_id, sucursal_id } });
            return found ? CajaMapper.mapSimple(found as any) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async asociarDispositivo(id: string, negocio_id: string, sucursal_id: string, token: string, ip: string, asociacionId: string): Promise<CajaObtenidoDetalle> {
        try {
            const existing = await this.prisma.caja.findFirst({ where: { id, negocio_id, sucursal_id } });
            if (!existing) {
                throw new Error('NOT_FOUND');
            }

            const updated = await this.prisma.caja.update({
                where: { id },
                data: {
                    token_autorizado: token,
                    ip_autorizada: ip || null,
                    asociacion_id: asociacionId,
                },
            });

            return CajaMapper.mapSimple(updated as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async desasociarDispositivo(id: string, negocio_id: string, sucursal_id: string, token?: string | null): Promise<void> {
        try {
            const normalizedToken = token?.trim();
            const existing = normalizedToken
                ? await this.prisma.caja.findFirst({ where: { id, negocio_id, sucursal_id, token_autorizado: normalizedToken } })
                : await this.prisma.caja.findFirst({ where: { id, negocio_id, sucursal_id } });

            if (!existing) {
                throw new Error('NOT_FOUND');
            }

            await this.prisma.caja.update({
                where: { id },
                data: {
                    token_autorizado: null,
                    ip_autorizada: null,
                    asociacion_id: null,
                },
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async listar(negocio_id: string, sucursal_id: string, pagination: Pagination, q?: string): Promise<Paginated<CajaSimple>> {
        try {
            const { page, perPage } = pagination;
            const skip = (page - 1) * perPage;
            const where: any = { negocio_id, sucursal_id };

            if (q) {
                where.nombre = { contains: q };
            }

            const [total, data] = await Promise.all([
                this.prisma.caja.count({ where }),
                this.prisma.caja.findMany({ where, skip, take: perPage, orderBy: { created_at: 'desc' } }),
            ]);

            return { total, data: data.map((item) => CajaMapper.mapSimple(item as any)), page, perPage };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
