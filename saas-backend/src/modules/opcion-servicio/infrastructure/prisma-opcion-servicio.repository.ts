import type { OpcionServicioCrear, OpcionServicioActualizar, OpcionServicioRepository } from "../domain/opcion-servicio.repository.js";
import type { OpcionServicioSimple } from "../domain/opcion-servicio.entity.js";
import type { PrismaClient } from "@prisma/client";

export class PrismaOpcionServicioRepository implements OpcionServicioRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async listar(negocio_id: string, page: number, perPage: number) {
        const [data, total] = await Promise.all([
            this.prisma.opcionServicio.findMany({
                where: { negocio_id },
                orderBy: { created_at: 'desc' },
                skip: (page - 1) * perPage,
                take: perPage,
            }),
            this.prisma.opcionServicio.count({ where: { negocio_id } })
        ]);

        return { data, total };
    }

    async obtener(id: string, negocio_id: string) {
        const opcion = await this.prisma.opcionServicio.findFirst({
            where: { id, negocio_id }
        });

        if (!opcion) {
            throw new Error('Opcion de servicio no encontrada');
        }

        return opcion as OpcionServicioSimple;
    }

    async registrar(data: OpcionServicioCrear, negocio_id: string) {
        const opcion = await this.prisma.opcionServicio.create({
            data: { ...data, negocio_id }
        });

        return opcion as OpcionServicioSimple;
    }

    async actualizar(id: string, negocio_id: string, data: OpcionServicioActualizar) {
        const updated = await this.prisma.opcionServicio.updateMany({
            where: { id, negocio_id },
            data
        });

        if (updated.count === 0) {
            throw new Error('Opcion de servicio no encontrada');
        }

        const opcion = await this.prisma.opcionServicio.findFirst({ where: { id, negocio_id } });
        if (!opcion) {
            throw new Error('Opcion de servicio no encontrada');
        }

        return opcion as OpcionServicioSimple;
    }

    async eliminar(id: string, negocio_id: string) {
        const deleted = await this.prisma.opcionServicio.deleteMany({
            where: { id, negocio_id }
        });

        if (deleted.count === 0) {
            throw new Error('Opcion de servicio no encontrada');
        }
    }
}
