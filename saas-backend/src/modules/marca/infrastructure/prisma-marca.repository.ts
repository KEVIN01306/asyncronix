import type { PrismaClient } from "@prisma/client";
import type { MarcaRepository } from "../domain/marca.repository.js";
import { MarcaMapper } from "./mappers/marca.mapper.js";
import type { MarcaSimple } from "../domain/marca.entity.js";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";

export class PrismaMarcaRepository implements MarcaRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async listar(params: { page: number; perPage: number; filters?: { q?: string } }) {
        const { page, perPage, filters } = params;
        const skip = (page - 1) * perPage;

        const where: any = { activo: true };
        if (filters?.q) {
            where.marca = { contains: filters.q };
        }

        try {
            const [total, items] = await Promise.all([
                this.prisma.marca.count({ where }),
                this.prisma.marca.findMany({ where, skip, take: perPage, orderBy: { marca: 'asc' } })
            ]);

            return { total, data: items.map(i => MarcaMapper.mapSimple(i as any)), page, perPage };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtener(id: string): Promise<MarcaSimple | null> {
        try {
            const item = await this.prisma.marca.findUnique({ where: { id } });
            if (!item || !item.activo) return null;
            return MarcaMapper.mapSimple(item as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
