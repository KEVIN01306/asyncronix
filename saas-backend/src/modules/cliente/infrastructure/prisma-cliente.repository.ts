import type { PrismaClient } from "@prisma/client";
import { PrismaErrorMapper } from "../../../shared/database/prisma/PrismaErrorMapper.js";
import type { Paginated } from "../../../shared/domain/paginated.js";
import type { ClienteActualizar, ClienteCrear, ClienteObtenidoDetalle, ClienteSimple } from "../domain/cliente.entity.js";
import type { ClienteRepository } from "../domain/cliente.repository.js";
import { ClienteMapper } from "./mappers/cliente.mapper.js";
import { NotFoundPersistenceError } from "../../../shared/database/errors/NotFoundPersistenceError.js";

export class PrismaClienteRepository implements ClienteRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async registrar(data: ClienteCrear, negocio_id: string): Promise<ClienteObtenidoDetalle> {
        try {
            const cliente = await this.prisma.cliente.create({
                data: {
                    ...data,
                    negocio_id,
                },
                include: { negocio: true },
            });

            return ClienteMapper.mapDetalle(cliente as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizar(id: string, negocio_id: string, data: ClienteActualizar): Promise<ClienteObtenidoDetalle> {
        try {
            const existing = await this.prisma.cliente.findFirst({ where: { id, negocio_id } });
            if (!existing) {
                throw new NotFoundPersistenceError();
            }

            const cliente = await this.prisma.cliente.update({
                where: { id },
                data,
                include: { negocio: true },
            });

            return ClienteMapper.mapDetalle(cliente as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminar(id: string, negocio_id: string): Promise<void> {
        try {
            const existing = await this.prisma.cliente.findFirst({ where: { id, negocio_id } });
            if (!existing) {
                throw new NotFoundPersistenceError();
            }

            await this.prisma.cliente.delete({
                where: { id },
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtener(id: string, negocio_id: string): Promise<ClienteObtenidoDetalle | null> {
        try {
            const cliente = await this.prisma.cliente.findFirst({
                where: { id, negocio_id },
                include: { negocio: true },
            });

            if (!cliente) {
                return null;
            }

            return ClienteMapper.mapDetalle(cliente as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async buscarPorDocumento(data: { nit?: string | null; dpi?: string | null }, negocio_id: string): Promise<ClienteObtenidoDetalle | null> {
        try {
            const filters = [] as Array<{ nit?: string | null; dpi?: string | null }>;

            if (data.nit) filters.push({ nit: data.nit });
            if (data.dpi) filters.push({ dpi: data.dpi });

            if (filters.length === 0) {
                return null;
            }

            const cliente = await this.prisma.cliente.findFirst({
                where: {
                    negocio_id,
                    OR: filters,
                },
                include: { negocio: true },
            });

            return cliente ? ClienteMapper.mapDetalle(cliente as any) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async listar(params: { negocio_id: string; page: number; perPage: number; q?: string | null; documento?: string | null }): Promise<Paginated<ClienteSimple>> {
        try {
            const { negocio_id, page, perPage, q, documento } = params;
            const skip = (page - 1) * perPage;

            const filters: any[] = [{ negocio_id }];

            const or: any[] = [];
            if (q) {
                or.push({ nombre: { contains: q } });
                or.push({ apellido: { contains: q } });
                or.push({ email: { contains: q } });
                or.push({ telefono: { contains: q } });
            }

            if (documento) {
                or.push({ nit: { contains: documento } });
                or.push({ dpi: { contains: documento } });
            }

            const where: any = { AND: filters };
            if (or.length > 0) where.AND.push({ OR: or });

            const [total, clientes] = await Promise.all([
                this.prisma.cliente.count({ where }),
                this.prisma.cliente.findMany({
                    where,
                    include: { negocio: true },
                    skip,
                    take: perPage,
                    orderBy: { created_at: 'desc' },
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
