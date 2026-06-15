import type { PrismaClient } from "@prisma/client";
import type { LineaRepository } from "../domain/linea.repository.js";
import { LineaMapper } from "./mappers/linea.mapper.js";
import type { LineaSimple } from "../domain/linea.entity.js";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";

export class PrismaLineaRepository implements LineaRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async listar(params: { page: number; perPage: number; filters?: { q?: string } }) {
        const { page, perPage, filters } = params;
        const skip = (page - 1) * perPage;

        const where: any = { activo: true };
        if (filters?.q) {
            where.linea = { contains: filters.q };
        }

        try {
            const [total, items] = await Promise.all([
                this.prisma.linea.count({ where }),
                this.prisma.linea.findMany({ where, skip, take: perPage, orderBy: { linea: 'asc' } })
            ]);

            return { total, data: items.map(i => LineaMapper.mapSimple(i as any)), page, perPage };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtener(id: string): Promise<LineaSimple | null> {
        try {
            const item = await this.prisma.linea.findUnique({ where: { id } });
            if (!item || !item.activo) return null;
            return LineaMapper.mapSimple(item as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
