import type { PrismaClient } from "@prisma/client";
import type { VehiculoRepository } from "../domain/vehiculo.repository.js";
import { VehiculoMapper } from "./mappers/vehiculo.mapper.js";
import type { VehiculoCrear, VehiculoActualizar } from "../domain/vehiculo.entity.js";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";

export class PrismaVehiculoRepository implements VehiculoRepository {
    constructor(private readonly db: PrismaClient) { }

    async listar(negocio_id: string, pagination: any) {
        const { page, perPage } = pagination;
        const skip = (page - 1) * perPage;
        try {
            const [total, items] = await Promise.all([
                this.db.vehiculo.count({ where: { negocio_id, activo: true } }),
                this.db.vehiculo.findMany({ where: { negocio_id, activo: true }, skip, take: perPage, orderBy: { created_at: 'desc' } })
            ]);

            return { total, data: items.map(i => VehiculoMapper.mapSimple(i)), page, perPage };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtener(id: string, negocio_id: string) {
        try {
            const v = await this.db.vehiculo.findFirst({
                where: { id, negocio_id, activo: true },
                include: {
                    modelo: { include: { marca: true, linea: true, cilindrada: true } },
                    vehiculo_tipo: true,
                    cliente: true
                }
            });
            if (!v) return null;
            return VehiculoMapper.mapDetalle(v as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtenerPorPlaca(placa: string, negocio_id: string) {
        try {
            const v = await this.db.vehiculo.findFirst({
                where: { placa, negocio_id, activo: true },
                include: {
                    modelo: { include: { marca: true, linea: true, cilindrada: true } },
                    vehiculo_tipo: true,
                    cliente: true
                }
            });
            if (!v) return null;
            return VehiculoMapper.mapDetalle(v as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async crear(data: VehiculoCrear, negocio_id: string) {
        try {
            const creado = await this.db.vehiculo.create({
                data: { ...data, negocio_id },
                include: {
                    modelo: { include: { marca: true, linea: true, cilindrada: true } },
                    vehiculo_tipo: true,
                    cliente: true
                }
            });
            return VehiculoMapper.mapDetalle(creado as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizar(id: string, negocio_id: string, data: VehiculoActualizar) {
        try {
            const actualizado = await this.db.vehiculo.update({
                where: { id, negocio_id, activo: true },
                data,
                include: {
                    modelo: { include: { marca: true, linea: true, cilindrada: true } },
                    vehiculo_tipo: true,
                    cliente: true
                }
            });
            return VehiculoMapper.mapDetalle(actualizado as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizarAvatar(id: string, negocio_id: string, avatar_url: string | null) {
        try {
            await this.db.vehiculo.update({ where: { id, negocio_id, activo: true }, data: { avatar_url } });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizarCalcomania(id: string, negocio_id: string, calcomania_url: string | null) {
        try {
            await this.db.vehiculo.update({ where: { id, negocio_id, activo: true }, data: { calcomania_url } });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
