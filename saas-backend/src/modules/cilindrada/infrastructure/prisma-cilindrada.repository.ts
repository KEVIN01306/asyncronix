import { Prisma, type PrismaClient } from "@prisma/client";
import type { CilindradaSimple } from "../domain/cilindrada.entity.js";
import type { CilindradaRepository } from "../domain/cilindrada.repository.js";
import { CilindradaMapper } from "./mappers/cilindrada.mapper.js";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";
import type { Pagination } from "@shared/domain/pagination.js";
import type { Paginated } from "@shared/domain/paginated.js";

export class PrismaCilindradaRepository implements CilindradaRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async listar(params: { page: number; perPage: number; filters?: { q?: string } }): Promise<Paginated<CilindradaSimple>> {
        const { page, perPage, filters } = params;
        const skip = (page - 1) * perPage;

        try {
            const baseCondition = Prisma.sql`activo = true`;
            const q = filters?.q?.trim();
            const queryCondition = q
                ? Prisma.sql`${baseCondition} AND CAST(cilindrada AS CHAR) LIKE ${`%${q}%`}`
                : baseCondition;

            const totalResult = await this.prisma.$queryRaw<Array<{ total: bigint | number }>>(
                Prisma.sql`SELECT COUNT(*) as total FROM cilindradas WHERE ${queryCondition}`
            );

            const rawItems = await this.prisma.$queryRaw<Array<{
                id: string;
                cilindrada: number;
                activo: boolean;
                created_at: Date;
                updated_at: Date;
            }>>(
                Prisma.sql`
                    SELECT id, cilindrada, activo, created_at, updated_at
                    FROM cilindradas
                    WHERE ${queryCondition}
                    ORDER BY cilindrada ASC
                    LIMIT ${perPage}
                    OFFSET ${skip}
                `
            );

            const totalValue = totalResult[0]?.total ?? 0;
            const total = typeof totalValue === 'bigint' ? Number(totalValue) : totalValue;

            return {
                total,
                data: rawItems.map(i => CilindradaMapper.mapSimple(i as any)),
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
