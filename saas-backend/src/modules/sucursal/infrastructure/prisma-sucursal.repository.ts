import type { PrismaClient } from "@prisma/client";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";
import type { Paginated } from "@shared/domain/paginated.js";
import type { SucursalActualizar, SucursalCrear, SucursalCrearPersistencia, SucursalObtenidoDetalle, SucursalSimple } from "../domain/sucursal.entity.js";
import type { SucursalRepository } from "../domain/sucursal.repository.js";
import { SucursalMapper } from "./mappers/sucursal.mapper.js";
import type { Pagination } from "@shared/domain/pagination.js";

export class PrismaSucursalRepository implements SucursalRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async contar(negocio_id: string): Promise<number> {
        try {
            return await this.prisma.sucursales.count({ where: { negocio_id } });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async registrar(data: SucursalCrearPersistencia, negocio_id: string): Promise<SucursalObtenidoDetalle> {
        try {
            const sucursal = await this.prisma.sucursales.create({
                data: {
                    ...data,
                    negocio_id,
                },
                include: { negocios: true },
            });

            return SucursalMapper.mapDetalle(sucursal);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizar(id: string, negocio_id: string, data: SucursalActualizar): Promise<SucursalObtenidoDetalle> {
        try {
            const sucursal = await this.prisma.sucursales.update({
                where: { id, negocio_id },
                data,
                include: { negocios: true },
            });

            return SucursalMapper.mapDetalle(sucursal);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminar(id: string, negocio_id: string): Promise<void> {
        try {
            await this.prisma.sucursales.delete({
                where: { id, negocio_id },
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtener(id: string, negocio_id: string): Promise<SucursalObtenidoDetalle | null> {
        try {
            const sucursal = await this.prisma.sucursales.findUnique({
                where: { id, negocio_id },
                include: { negocios: true },
            });

            if (!sucursal) {
                return null;
            }

            return SucursalMapper.mapDetalle(sucursal);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async listar(negocio_id: string, pagination: Pagination): Promise<Paginated<SucursalSimple>> {
        try {
            const { page, perPage } = pagination;
            const skip = (page - 1) * perPage;

            const [total, sucursales] = await Promise.all([
                this.prisma.sucursales.count({ where: { negocio_id } }),
                this.prisma.sucursales.findMany({
                    where: { negocio_id },
                    include: { negocios: true },
                    skip,
                    take: perPage,
                    orderBy: { nombre: 'asc' },
                }),
            ]);

            return {
                total,
                data: sucursales.map(s => SucursalMapper.mapSimple(s)),
                page,
                perPage,
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
