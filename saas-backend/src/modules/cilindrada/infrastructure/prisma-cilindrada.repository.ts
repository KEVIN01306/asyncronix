import type { PrismaClient } from "@prisma/client";
import type { CilindradaSimple } from "../domain/cilindrada.entity.js";
import type { CilindradaRepository } from "../domain/cilindrada.repository.js";
import { CilindradaMapper } from "./mappers/cilindrada.mapper.js";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";
import type { Pagination } from "@shared/domain/pagination.js";
import type { Paginated } from "@shared/domain/paginated.js";

export class PrismaCilindradaRepository implements CilindradaRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async listar(params: { page: number; perPage: number }): Promise<Paginated<CilindradaSimple>> {
        const { page, perPage } = params;
        const skip = (page - 1) * perPage;

        try {
            const [total, items] = await Promise.all([
                this.prisma.cilindrada.count({ where: { activo: true } }),
                this.prisma.cilindrada.findMany({ where: { activo: true }, skip, take: perPage, orderBy: { cilindrada: 'asc' } })
            ]);

            return {
                total,
                data: items.map(i => CilindradaMapper.mapSimple(i as any)),
                page,
                perPage,
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtener(id: string): Promise<CilindradaSimple | null> {
        try {
            const item = await this.prisma.cilindrada.findUnique({ where: { id } });
            if (!item || !item.activo) return null;
            return CilindradaMapper.mapSimple(item as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
