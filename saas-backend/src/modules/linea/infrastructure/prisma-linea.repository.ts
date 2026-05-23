import type { PrismaClient } from "@prisma/client";
import type { LineaRepository } from "../domain/linea.repository.js";
import { LineaMapper } from "./mappers/linea.mapper.js";
import type { LineaSimple } from "../domain/linea.entity.js";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";

export class PrismaLineaRepository implements LineaRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async listar(params: { page: number; perPage: number }) {
        const { page, perPage } = params;
        const skip = (page - 1) * perPage;
        try {
            const [total, items] = await Promise.all([
                this.prisma.linea.count({ where: { activo: true } }),
                this.prisma.linea.findMany({ where: { activo: true }, skip, take: perPage, orderBy: { linea: 'asc' } })
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
