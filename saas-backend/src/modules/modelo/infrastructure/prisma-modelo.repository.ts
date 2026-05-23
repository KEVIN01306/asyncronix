import type { PrismaClient } from "@prisma/client";
import type { ModeloRepository, ModeloFilters } from "../domain/modelo.repository.js";
import { ModeloMapper } from "./mappers/modelo.mapper.js";
import type { ModeloSimple } from "../domain/modelo.entity.js";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";

export class PrismaModeloRepository implements ModeloRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async listar(params: { page: number; perPage: number; filters?: ModeloFilters }) {
        const { page, perPage, filters } = params;
        const skip = (page - 1) * perPage;

        const where: any = { activo: true };
        if (filters?.marca_id?.length) where.marca_id = { in: filters.marca_id };
        if (filters?.linea_id?.length) where.linea_id = { in: filters.linea_id };
        if (filters?.cilindrada_id?.length) where.cilindrada_id = { in: filters.cilindrada_id };

        try {
            const [total, items] = await Promise.all([
                this.prisma.modelo.count({ where }),
                this.prisma.modelo.findMany({ where, skip, take: perPage, include: { marca: true, linea: true, cilindrada: true }, orderBy: { modelo: 'asc' } })
            ]);

            return { total, data: items.map(i => ModeloMapper.mapSimple(i as any)), page, perPage };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtener(id: string): Promise<ModeloSimple | null> {
        try {
            const item = await this.prisma.modelo.findUnique({ where: { id }, include: { marca: true, linea: true, cilindrada: true } });
            if (!item || !item.activo) return null;
            return ModeloMapper.mapSimple(item as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
