import type { PrismaClient } from '@prisma/client';
import { PrismaErrorMapper } from '@shared/database/prisma/PrismaErrorMapper.js';
import type { Paginated } from '@shared/domain/paginated.js';
import type { ProveedorCrear, ProveedorActualizar, ProveedorObtenidoDetalle, ProveedorSimple } from '../domain/proveedor.entity.js';
import type { ProveedorRepository } from '../domain/proveedor.repository.js';
import { ProveedorMapper } from './mappers/proveedor.mapper.js';
import { NotFoundPersistenceError } from '@shared/database/errors/NotFoundPersistenceError.js';

export class PrismaProveedorRepository implements ProveedorRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async registrar(data: ProveedorCrear, negocio_id: string): Promise<ProveedorObtenidoDetalle> {
        try {
            const created = await this.prisma.proveedor.create({ data: { ...data, negocio_id } });
            return ProveedorMapper.mapDetalle(created as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizar(id: string, negocio_id: string, data: ProveedorActualizar): Promise<ProveedorObtenidoDetalle> {
        try {
            const existing = await this.prisma.proveedor.findFirst({ where: { id, negocio_id } });
            if (!existing) throw new NotFoundPersistenceError();
            const updated = await this.prisma.proveedor.update({ where: { id }, data });
            return ProveedorMapper.mapDetalle(updated as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminar(id: string, negocio_id: string): Promise<void> {
        try {
            const existing = await this.prisma.proveedor.findFirst({ where: { id, negocio_id } });
            if (!existing) throw new NotFoundPersistenceError();
            await this.prisma.proveedor.delete({ where: { id } });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtener(id: string, negocio_id: string): Promise<ProveedorObtenidoDetalle | null> {
        try {
            const found = await this.prisma.proveedor.findFirst({ where: { id, negocio_id } });
            return found ? ProveedorMapper.mapDetalle(found as any) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async listar(params: { negocio_id: string; page: number; perPage: number; q?: string | null }): Promise<Paginated<ProveedorSimple>> {
        try {
            const { negocio_id, page, perPage, q } = params;
            const skip = (page - 1) * perPage;
            const where: any = { negocio_id };

            if (q) {
                where.OR = [
                    { nombre: { contains: q } },
                    { contacto: { contains: q } },
                    { telefono: { contains: q } },
                    { email: { contains: q } },
                    { nit: { contains: q } },
                ];
            }

            const [total, data] = await Promise.all([
                this.prisma.proveedor.count({ where }),
                this.prisma.proveedor.findMany({ where, skip, take: perPage, orderBy: { created_at: 'desc' } })
            ]);

            return { total, data: data.map(d => ProveedorMapper.mapSimple(d as any)), page, perPage };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
