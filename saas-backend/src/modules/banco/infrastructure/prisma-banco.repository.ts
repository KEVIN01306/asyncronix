import type { PrismaClient } from "@prisma/client";
import type { BancoRepository } from "../domain/banco.repository.js";
import { BancoMapper } from "./mappers/banco.mapper.js";
import type { BancoSimple } from "../domain/banco.entity.js";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";

export class PrismaBancoRepository implements BancoRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async listar(params: { page: number; perPage: number; filters?: { q?: string } }) {
        const { page, perPage, filters } = params;
        const skip = (page - 1) * perPage;

        const where: any = { activo: true };
        if (filters?.q) {
            where.OR = [
                { nombre_comercial: { contains: filters.q, mode: 'insensitive' } },
                { razon_social: { contains: filters.q, mode: 'insensitive' } }
            ];
        }

        try {
            const [total, items] = await Promise.all([
                this.prisma.banco.count({ where }),
                this.prisma.banco.findMany({ where, skip, take: perPage, orderBy: { nombre_comercial: 'asc' } })
            ]);

            return { total, data: items.map((item) => BancoMapper.mapSimple(item as any)), page, perPage };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtener(id: string): Promise<BancoSimple | null> {
        try {
            const banco = await this.prisma.banco.findUnique({ where: { id } });
            if (!banco || !banco.activo) return null;
            return BancoMapper.mapSimple(banco as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
