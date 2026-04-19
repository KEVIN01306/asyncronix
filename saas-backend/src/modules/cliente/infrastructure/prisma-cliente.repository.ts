import type { PrismaClient } from "@prisma/client";
import { PrismaErrorMapper } from "../../../shared/database/prisma/PrismaErrorMapper.js";
import type { Paginated } from "../../../shared/domain/paginated.js";
import type { ClienteActualizar, ClienteCrear, ClienteObtenidoDetalle, ClienteSimple } from "../domain/cliente.entity.js";
import type { ClienteRepository } from "../domain/cliente.repository.js";
import { ClienteMapper } from "./mappers/cliente.mapper.js";

export class PrismaClienteRepository implements ClienteRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async registrar(data: ClienteCrear, negocio_id: string): Promise<ClienteObtenidoDetalle> {
        try {
            const cliente = await this.prisma.clientes.create({
                data: {
                    ...data,
                    negocio_id,
                },
                include: { negocios: true },
            });

            return ClienteMapper.mapDetalle(cliente as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizar(id: string, negocio_id: string, data: ClienteActualizar): Promise<ClienteObtenidoDetalle> {
        try {
            const cliente = await this.prisma.clientes.update({
                where: { id, negocio_id },
                data,
                include: { negocios: true },
            });

            return ClienteMapper.mapDetalle(cliente as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminar(id: string, negocio_id: string): Promise<void> {
        try {
            await this.prisma.clientes.delete({
                where: { id, negocio_id },
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtener(id: string, negocio_id: string): Promise<ClienteObtenidoDetalle | null> {
        try {
            const cliente = await this.prisma.clientes.findUnique({
                where: { id, negocio_id },
                include: { negocios: true },
            });

            if (!cliente) {
                return null;
            }

            return ClienteMapper.mapDetalle(cliente as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async listar(params: { negocio_id: string; page: number; perPage: number }): Promise<Paginated<ClienteSimple>> {
        try {
            const { negocio_id, page, perPage } = params;
            const skip = (page - 1) * perPage;

            const [total, clientes] = await Promise.all([
                this.prisma.clientes.count({ where: { negocio_id } }),
                this.prisma.clientes.findMany({
                    where: { negocio_id },
                    include: { negocios: true },
                    skip,
                    take: perPage,
                    orderBy: { fecha_registro: 'desc' },
                }),
            ]);

            return {
                total,
                data: clientes.map(c => ClienteMapper.mapSimple(c as any)),
                page,
                perPage,
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
