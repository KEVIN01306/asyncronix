import type { PrismaClient } from "@prisma/client";
import type { VehiculoTipoRepository } from "../domain/vehiculotipo.repository.js";
import { VehiculoTipoMapper } from "./mappers/vehiculotipo.mapper.js";
import type { VehiculoTipoSimple } from "../domain/vehiculotipo.entity.js";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";

export class PrismaVehiculoTipoRepository implements VehiculoTipoRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async listar(params: { page: number; perPage: number }) {
        const { page, perPage } = params;
        const skip = (page - 1) * perPage;
        try {
            const [total, items] = await Promise.all([
                this.prisma.vehiculoTipo.count({ where: { activo: true } }),
                this.prisma.vehiculoTipo.findMany({ where: { activo: true }, skip, take: perPage, orderBy: { tipo: 'asc' } })
            ]);

            return { total, data: items.map(i => VehiculoTipoMapper.mapSimple(i as any)), page, perPage };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
