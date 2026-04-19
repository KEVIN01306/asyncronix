import type { Prisma, PrismaClient } from "@prisma/client";
import type { Gasto, GastoActualizar, GastoCrear, GastoDetalle, GastoSimple } from "../domain/gasto.entity.js";
import type { GastoRepository } from "../domain/gasto.reposity.js";
import { GastoMapper } from "./mappers/gasto.mapper.js";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";
import type { Pagination } from "@shared/domain/pagination.js";
import type { Paginated } from "@shared/domain/paginated.js";


export class PrismaGastoRepository implements GastoRepository {

    constructor(private readonly prisma: PrismaClient) { }

    async obtener(id: Gasto["id"], negocio_id: Gasto["negocio_id"]): Promise<GastoDetalle | null> {
        const gasto = await this.prisma.gastos.findFirst({
            where: { id, negocio_id },
            include: { sucursales: { select: { id: true, nombre: true } } }
        })

        if (!gasto) return null

        return GastoMapper.mapDetalle(gasto)
    }

    async listar(
        negocio_id: Gasto["negocio_id"],
        pagination: Pagination,
        sucursal_ids?: string[]
    ): Promise<Paginated<GastoSimple>> {
        const { page, perPage } = pagination
        const offset = (page - 1) * perPage

        const where: Prisma.gastosWhereInput = {
            negocio_id,
            ...(sucursal_ids && sucursal_ids.length > 0 && { sucursal_id: { in: sucursal_ids } })
        }

        const [total, gastos] = await Promise.all([
            this.prisma.gastos.count({ where }),
            this.prisma.gastos.findMany({
                where,
                include: { sucursales: { select: { id: true, nombre: true } } },
                take: perPage,
                skip: offset,
                orderBy: { fecha: 'desc' }
            })
        ])

        return {
            data: gastos.map(gasto => GastoMapper.mapSimple(gasto)),
            total,
            page,
            perPage
        }
    }


    async registrar(gasto: GastoCrear, negocio_id: Gasto['negocio_id']): Promise<GastoSimple> {
        try {
            const nuevoGasto = await this.prisma.gastos.create({
                data: {
                    ...gasto,
                    negocio_id,
                    categoria_gasto: GastoMapper.mapCategoriaBaseDatos(gasto.categoria_gasto),
                    fecha: new Date()
                },
                include: { sucursales: { select: { id: true, nombre: true } } }
            })

            return GastoMapper.mapSimple(nuevoGasto)
        } catch (error) {
            throw PrismaErrorMapper.map(error)
        }
    }

    async actualizar(id: string, gasto: GastoActualizar, negocio_id: string): Promise<GastoSimple> {
        try {
            const gastoActualizado = await this.prisma.gastos.update({
                where: { id, negocio_id },
                data: {
                    ...gasto,
                    ...(gasto.categoria_gasto && { categoria_gasto: GastoMapper.mapCategoriaBaseDatos(gasto.categoria_gasto) }),
                    ...(gasto.fecha && { fecha: new Date(gasto.fecha) })
                },
                include: { sucursales: { select: { id: true, nombre: true } } }
            })

            return GastoMapper.mapSimple(gastoActualizado)
        } catch (error) {
            throw PrismaErrorMapper.map(error)
        }
    }

    async eliminar(id: string, negocio_id: string): Promise<void> {
        try {
            await this.prisma.gastos.delete({
                where: { id, negocio_id }
            })
        } catch (error) {
            throw PrismaErrorMapper.map(error)
        }
    }
}
