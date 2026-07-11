import type { PrismaClient } from '@prisma/client';
import { PrismaErrorMapper } from '@shared/database/prisma/PrismaErrorMapper.js';
import type { Paginated } from '@shared/domain/paginated.js';
import type { CuentaBancariaActualizar, CuentaBancariaCrear, CuentaBancariaObtenidoDetalle, CuentaBancariaSimple } from '../domain/cuenta-bancaria.entity.js';
import type { CuentaBancariaRepository } from '../domain/cuenta-bancaria.repository.js';
import { CuentaBancariaMapper } from './mappers/cuenta-bancaria.mapper.js';
import type { Pagination } from '@shared/domain/pagination.js';

export class PrismaCuentaBancariaRepository implements CuentaBancariaRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async registrar(data: CuentaBancariaCrear, negocio_id: string): Promise<CuentaBancariaObtenidoDetalle> {
        try {
            const created = await this.prisma.cuentaBancaria.create({
                data: {
                    ...data,
                    negocio_id,
                },
                include: {
                    banco: true,
                    moneda: true,
                },
            });
            return CuentaBancariaMapper.mapSimple(created as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizar(id: string, negocio_id: string, data: CuentaBancariaActualizar): Promise<CuentaBancariaObtenidoDetalle> {
        try {
            const existing = await this.prisma.cuentaBancaria.findFirst({ where: { id, negocio_id } });
            if (!existing) {
                throw new Error('NOT_FOUND');
            }
            const updated = await this.prisma.cuentaBancaria.update({
                where: { id },
                data,
                include: {
                    banco: true,
                    moneda: true,
                },
            });
            return CuentaBancariaMapper.mapSimple(updated as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizarSaldo(id: string, negocio_id: string, nuevoSaldo: number, options?: { tx?: any }): Promise<CuentaBancariaObtenidoDetalle> {
        try {
            const db = options?.tx || this.prisma;
            const existing = await db.cuentaBancaria.findFirst({ where: { id, negocio_id } });
            if (!existing) {
                throw new Error('NOT_FOUND');
            }
            const updated = await db.cuentaBancaria.update({
                where: { id },
                data: { saldo: nuevoSaldo },
                include: {
                    banco: true,
                    moneda: true,
                },
            });
            return CuentaBancariaMapper.mapSimple(updated as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminar(id: string, negocio_id: string): Promise<void> {
        try {
            const existing = await this.prisma.cuentaBancaria.findFirst({ where: { id, negocio_id } });
            if (!existing) {
                throw new Error('NOT_FOUND');
            }
            await this.prisma.cuentaBancaria.delete({ where: { id } });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtener(id: string, negocio_id: string, options?: { tx?: any }): Promise<CuentaBancariaObtenidoDetalle | null> {
        try {
            const db = options?.tx || this.prisma;
            const found = await db.cuentaBancaria.findFirst({
                where: { id, negocio_id },
                include: {
                    banco: true,
                    moneda: true,
                },
            });
            return found ? CuentaBancariaMapper.mapSimple(found as any) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async listar(negocio_id: string, pagination: Pagination, q?: string): Promise<Paginated<CuentaBancariaSimple>> {
        try {
            const { page, perPage } = pagination;
            const skip = (page - 1) * perPage;
            const where: any = { negocio_id };
            if (q) {
                where.OR = [
                    { numero_cuenta: { contains: q } },
                    { nombre_titular: { contains: q } },
                ];
            }

            const [total, data] = await Promise.all([
                this.prisma.cuentaBancaria.count({ where }),
                this.prisma.cuentaBancaria.findMany({
                    where,
                    skip,
                    take: perPage,
                    orderBy: { created_at: 'desc' },
                    include: {
                        banco: true,
                        moneda: true,
                    },
                }),
            ]);

            return { total, data: data.map((item) => CuentaBancariaMapper.mapSimple(item as any)), page, perPage };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
