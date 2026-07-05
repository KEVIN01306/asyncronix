import type { PrismaClient } from "@prisma/client";
import type { PaisRepository } from "../domain/pais.repository.js";
import { PaisMapper } from "./mappers/pais.mapper.js";
import type { PaisSimple } from "../domain/pais.entity.js";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";

export class PrismaPaisRepository implements PaisRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async listar(params: { page: number; perPage: number; filters?: { q?: string } }) {
        const { page, perPage, filters } = params;
        const skip = (page - 1) * perPage;

        const where: any = { activo: true };
        if (filters?.q) {
            where.nombre = { contains: filters.q };
        }

        try {
            const [total, items] = await Promise.all([
                this.prisma.pais.count({ where }),
                this.prisma.pais.findMany({ where, skip, take: perPage, orderBy: { nombre: 'asc' } })
            ]);

            return { total, data: items.map(i => PaisMapper.mapSimple(i as any)), page, perPage };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtener(id: string): Promise<PaisSimple | null> {
        try {
            const item = await this.prisma.pais.findUnique({ where: { id } });
            if (!item || !item.activo) return null;
            return PaisMapper.mapSimple(item as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
