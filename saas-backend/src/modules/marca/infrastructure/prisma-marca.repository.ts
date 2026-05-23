import type { PrismaClient } from "@prisma/client";
import type { MarcaRepository } from "../domain/marca.repository.js";
import { MarcaMapper } from "./mappers/marca.mapper.js";
import type { MarcaSimple } from "../domain/marca.entity.js";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";

export class PrismaMarcaRepository implements MarcaRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async listar(params: { page: number; perPage: number }) {
        const { page, perPage } = params;
        const skip = (page - 1) * perPage;
        try {
            const [total, items] = await Promise.all([
                this.prisma.marca.count({ where: { activo: true } }),
                this.prisma.marca.findMany({ where: { activo: true }, skip, take: perPage, orderBy: { marca: 'asc' } })
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
