import type { PrismaClient } from "@prisma/client";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";
import type { NegocioActualizar, NegocioCrear, NegocioObtenidoDetalle } from "../domain/negocio.entity.js";
import type { NegocioRepository } from "../domain/negocio.repository.js";
import type { NegocioLimite } from "../domain/negocio-limite.entity.js";
import { NegocioMapper } from "./mappers/negocio.mapper.js";

export class PrismaNegocioRepository implements NegocioRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async registrar(data: NegocioCrear & { logo_url: string | null }): Promise<NegocioObtenidoDetalle> {
        try {
            const negocio = await this.prisma.negocio.create({
                data: {
                    ...data,
                    fecha_registro: new Date()
                },
                include: {
                    pais: true,
                    moneda: true,
                }
            });

            return NegocioMapper.mapDetalle(negocio);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizar(id: string, data: NegocioActualizar): Promise<NegocioObtenidoDetalle> {
        try {
            const negocio = await this.prisma.negocio.update({
                where: { id },
                data,
                include: {
                    pais: true,
                    moneda: true,
                }
            });

            return NegocioMapper.mapDetalle(negocio);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtener(id: string): Promise<NegocioObtenidoDetalle | null> {
        try {
            const negocio = await this.prisma.negocio.findUnique({
                where: { id },
                include: {
                    pais: true,
                    moneda: true,
                }
            });

            if (!negocio) return null;

            return NegocioMapper.mapDetalle(negocio);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtenerPorWaId(wa_id: string): Promise<NegocioObtenidoDetalle | null> {
        try {
            const negocio = await this.prisma.negocio.findUnique({
                where: { wa_id },
                include: {
                    pais: true,
                    moneda: true,
                }
            });

            if (!negocio) return null;

            return NegocioMapper.mapDetalle(negocio);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async listar(wa_id: string): Promise<NegocioObtenidoDetalle | null> {
        try {
            const negocio = await this.prisma.negocio.findUnique({
                where: { wa_id },
                include: {
                    pais: true,
                    moneda: true,
                }
            });

            if (!negocio) return null;

            return NegocioMapper.mapDetalle(negocio);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async cambiarMoneda(id: string, moneda_id: string): Promise<NegocioObtenidoDetalle> {
        try {
            const negocio = await this.prisma.negocio.update({
                where: { id },
                data: { moneda_id },
                include: {
                    pais: true,
                    moneda: true,
                }
            });

            return NegocioMapper.mapDetalle(negocio);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtenerLimites(negocio_id: string): Promise<NegocioLimite> {
        try {
            const limites = await this.prisma.negocioLimite.findUnique({
                where: { negocio_id }
            });

            if (!limites) {
                // If it doesn't exist, we might return the defaults directly, or throw an error. 
                // Creating one by default might be a good idea, but for now we just return the Prisma model and let the use case handle it or throw if not found.
                // Assuming every business has a limite created on registration.
                throw new Error('Límites no encontrados para el negocio');
            }
            return limites;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async incrementarStorage(negocio_id: string, bytes: number): Promise<void> {
        await this.prisma.negocioLimite.update({
            where: { negocio_id },
            data: {
                storage_bytes_used: {
                    increment: bytes
                }
            }
        });
    }

    async decrementarStorage(negocio_id: string, bytes: number): Promise<void> {
        await this.prisma.negocioLimite.update({
            where: { negocio_id },
            data: {
                storage_bytes_used: {
                    decrement: bytes
                }
            }
        });
    }
}
