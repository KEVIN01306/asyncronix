import type { PrismaClient } from '@prisma/client';
import { PrismaErrorMapper } from '@shared/database/prisma/PrismaErrorMapper.js';
import { NotFoundPersistenceError } from '@shared/database/errors/NotFoundPersistenceError.js';
import type { Paginated } from '@shared/domain/paginated.js';
import type { CategoriaTransaccionActualizar, CategoriaTransaccionCrear, CategoriaTransaccionSimple } from '../domain/categoria-transaccion.entity.js';
import type { CategoriaTransaccionRepository } from '../domain/categoria-transaccion.repository.js';
import { CategoriaTransaccionMapper } from './mappers/categoria-transaccion.mapper.js';

export class PrismaCategoriaTransaccionRepository implements CategoriaTransaccionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async registrar(data: CategoriaTransaccionCrear, negocio_id: string): Promise<CategoriaTransaccionSimple> {
    try {
      const record = await this.prisma.categoriaTransaccion.create({
        data: {
          ...data,
          negocio_id,
          activo: data.activo ?? true,
        },
      });
      return CategoriaTransaccionMapper.mapSimple(record as any);
    } catch (error) {
      throw PrismaErrorMapper.map(error);
    }
  }

  async actualizar(id: string, negocio_id: string, data: CategoriaTransaccionActualizar): Promise<CategoriaTransaccionSimple> {
    try {
      const existing = await this.prisma.categoriaTransaccion.findFirst({ where: { id, negocio_id } });
      if (!existing) {
        throw new NotFoundPersistenceError();
      }

      const record = await this.prisma.categoriaTransaccion.update({
        where: { id },
        data,
      });
      return CategoriaTransaccionMapper.mapSimple(record as any);
    } catch (error) {
      throw PrismaErrorMapper.map(error);
    }
  }

  async eliminar(id: string, negocio_id: string): Promise<void> {
    try {
      const existing = await this.prisma.categoriaTransaccion.findFirst({ where: { id, negocio_id } });
      if (!existing) {
        throw new NotFoundPersistenceError();
      }

      await this.prisma.categoriaTransaccion.update({
        where: { id },
        data: { activo: false },
      });
    } catch (error) {
      throw PrismaErrorMapper.map(error);
    }
  }

  async obtener(id: string, negocio_id: string): Promise<CategoriaTransaccionSimple | null> {
    try {
      const record = await this.prisma.categoriaTransaccion.findFirst({
        where: { id, negocio_id },
      });
      return record ? CategoriaTransaccionMapper.mapSimple(record as any) : null;
    } catch (error) {
      throw PrismaErrorMapper.map(error);
    }
  }

  async listar(negocio_id: string, page: number, perPage: number, filters?: { q?: string; tipo?: string | null }): Promise<Paginated<CategoriaTransaccionSimple>> {
    try {
      const skip = (page - 1) * perPage;
      const where: any = { negocio_id };

      if (filters?.q?.trim()) {
        where.nombre = { contains: filters.q.trim() };
      }

      if (filters?.tipo) {
        where.tipo = filters.tipo;
      }

      const [total, data] = await Promise.all([
        this.prisma.categoriaTransaccion.count({ where }),
        this.prisma.categoriaTransaccion.findMany({
          where,
          skip,
          take: perPage,
          orderBy: { created_at: 'desc' },
        }),
      ]);

      return {
        total,
        data: data.map((item) => CategoriaTransaccionMapper.mapSimple(item as any)),
        page,
        perPage,
      };
    } catch (error) {
      throw PrismaErrorMapper.map(error);
    }
  }
}
