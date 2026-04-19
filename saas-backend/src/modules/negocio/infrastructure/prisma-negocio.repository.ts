import type { PrismaClient } from "@prisma/client";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";
import type { NegocioActualizar, NegocioCrear, NegocioObtenidoDetalle } from "../domain/negocio.entity.js";
import type { NegocioRepository } from "../domain/negocio.repository.js";
import { NegocioMapper } from "./mappers/negocio.mapper.js";

export class PrismaNegocioRepository implements NegocioRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async registrar(data: NegocioCrear & { logo_url: string | null }): Promise<NegocioObtenidoDetalle> {
        try {
            const negocio = await this.prisma.negocios.create({
                data: {
                    ...data,
                    fecha_registro: new Date()
                }
            });

            return NegocioMapper.mapDetalle(negocio);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizar(id: string, data: NegocioActualizar): Promise<NegocioObtenidoDetalle> {
        try {
            const negocio = await this.prisma.negocios.update({
                where: { id },
                data
            });

            return NegocioMapper.mapDetalle(negocio);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtener(id: string): Promise<NegocioObtenidoDetalle | null> {
        try {
            const negocio = await this.prisma.negocios.findUnique({
                where: { id }
            });

            if (!negocio) return null;

            return NegocioMapper.mapDetalle(negocio);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtenerPorWaId(wa_id: string): Promise<NegocioObtenidoDetalle | null> {
        try {
            const negocio = await this.prisma.negocios.findUnique({
                where: { wa_id }
            });

            if (!negocio) return null;

            return NegocioMapper.mapDetalle(negocio);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async listar(wa_id: string): Promise<NegocioObtenidoDetalle | null> {
        try {
            const negocio = await this.prisma.negocios.findUnique({
                where: { wa_id }
            });

            if (!negocio) return null;

            return NegocioMapper.mapDetalle(negocio);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
