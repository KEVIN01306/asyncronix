import type { PrismaClient } from "@prisma/client";
import type { MonedaRepository } from "../domain/moneda.repository.js";
import { MonedaMapper } from "./mappers/moneda.mapper.js";
import type { MonedaSimple } from "../domain/moneda.entity.js";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";

export class PrismaMonedaRepository implements MonedaRepository {
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
                this.prisma.moneda.count({ where }),
                this.prisma.moneda.findMany({ where, skip, take: perPage, orderBy: { nombre: 'asc' } })
            ]);

            return { total, data: items.map(i => MonedaMapper.mapSimple(i as any)), page, perPage };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtener(id: string): Promise<MonedaSimple | null> {
        try {
            const item = await this.prisma.moneda.findUnique({ where: { id } });
            if (!item || !item.activo) return null;
            return MonedaMapper.mapSimple(item as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
