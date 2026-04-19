import type { PrismaClient } from "@prisma/client";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";
import type { Paginated } from "@shared/domain/paginated.js";
import type { ProveedorActualizar, ProveedorCrear, ProveedorObtenidoDetalle, ProveedorSimple } from "../domain/proveedor.entity.js";
import type { ProveedorRepository } from "../domain/proveedor.repository.js";
import { ProveedorMapper } from "./mappers/proveedor.mapper.js";

export class PrismaProveedorRepository implements ProveedorRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async registrar(data: ProveedorCrear, negocio_id: string): Promise<ProveedorObtenidoDetalle> {
        try {
            const proveedor = await this.prisma.proveedores.create({
                data: {
                    ...data,
                    negocio_id,
                },
                include: { negocios: true },
            });

            return ProveedorMapper.mapDetalle(proveedor as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizar(id: string, negocio_id: string, data: ProveedorActualizar): Promise<ProveedorObtenidoDetalle> {
        try {
            const proveedor = await this.prisma.proveedores.update({
                where: { id, negocio_id },
                data,
                include: { negocios: true },
            });

            return ProveedorMapper.mapDetalle(proveedor as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminar(id: string, negocio_id: string): Promise<void> {
        try {
            await this.prisma.proveedores.delete({
                where: { id, negocio_id },
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtener(id: string, negocio_id: string): Promise<ProveedorObtenidoDetalle | null> {
        try {
            const proveedor = await this.prisma.proveedores.findUnique({
                where: { id, negocio_id },
                include: { negocios: true },
            });

            if (!proveedor) {
                return null;
            }

            return ProveedorMapper.mapDetalle(proveedor as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async listar(params: { negocio_id: string; page: number; perPage: number }): Promise<Paginated<ProveedorSimple>> {
        try {
            const { negocio_id, page, perPage } = params;
            const skip = (page - 1) * perPage;

            const [total, proveedores] = await Promise.all([
                this.prisma.proveedores.count({ where: { negocio_id } }),
                this.prisma.proveedores.findMany({
                    where: { negocio_id },
                    include: { negocios: true },
                    skip,
                    take: perPage,
                    orderBy: { nombre: 'asc' },
                }),
            ]);

            return {
                total,
                data: proveedores.map(p => ProveedorMapper.mapSimple(p as any)),
                page,
                perPage,
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
