import type { TipoServicioActualizar, TipoServicioCrear, TipoServicioRepository } from "../domain/tipo-servicio.repository.js";
import type { TipoServicioSimple } from "../domain/tipo-servicio.entity.js";
import type { PrismaClient } from "@prisma/client";

const mapTipoServicio = (record: any): TipoServicioSimple => ({
    id: record.id,
    negocio_id: record.negocio_id,
    nombre: record.nombre,
    precio_base: record.precio_base,
    checklist: record.checklist ?? true,
    activo: record.activo,
    created_at: record.created_at,
    updated_at: record.updated_at,
    opciones: record.opciones?.map((item: any) => ({
        id: item.opcion_servicio.id,
        negocio_id: item.opcion_servicio.negocio_id,
        nombre: item.opcion_servicio.nombre,
        descripcion: item.opcion_servicio.descripcion ?? undefined,
        activo: item.opcion_servicio.activo,
        created_at: item.opcion_servicio.created_at,
        updated_at: item.opcion_servicio.updated_at,
    })) ?? []
});

export class PrismaTipoServicioRepository implements TipoServicioRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async listar(negocio_id: string, page: number, perPage: number) {
        const [data, total] = await Promise.all([
            this.prisma.tipoServicio.findMany({
                where: { negocio_id },
                orderBy: { created_at: 'desc' },
                skip: (page - 1) * perPage,
                take: perPage,
                include: {
                    opciones: {
                        include: { opcion_servicio: true }
                    }
                }
            }),
            this.prisma.tipoServicio.count({ where: { negocio_id } })
        ]);

        return { data: data.map(mapTipoServicio), total };
    }

    async obtener(id: string, negocio_id: string) {
        const record = await this.prisma.tipoServicio.findFirst({
            where: { id, negocio_id },
            include: {
                opciones: {
                    include: { opcion_servicio: true }
                }
            }
        });

        if (!record) {
            throw new Error('Tipo de servicio no encontrado');
        }

        return mapTipoServicio(record);
    }

    async registrar(data: TipoServicioCrear, negocio_id: string) {
        const { opciones_ids = [], ...rest } = data;
        const tipoServicio = await this.prisma.tipoServicio.create({
            data: {
                ...rest,
                negocio_id,
                opciones: {
                    create: opciones_ids.map((opcion_id, index) => ({
                        opcion_servicio_id: opcion_id,
                        orden: index
                    }))
                }
            },
            include: {
                opciones: {
                    include: { opcion_servicio: true }
                }
            }
        });

        return mapTipoServicio(tipoServicio);
    }

    async actualizar(id: string, negocio_id: string, data: TipoServicioActualizar) {
        const { opciones_ids, ...rest } = data;
        const updated = await this.prisma.tipoServicio.updateMany({
            where: { id, negocio_id },
            data: rest
        });

        if (updated.count === 0) {
            throw new Error('Tipo de servicio no encontrado');
        }

        if (opciones_ids) {
            await this.prisma.tipoServicioOpcion.deleteMany({
                where: { tipo_servicio_id: id }
            });

            if (opciones_ids.length > 0) {
                await this.prisma.tipoServicioOpcion.createMany({
                    data: opciones_ids.map((opcion_id, index) => ({
                        tipo_servicio_id: id,
                        opcion_servicio_id: opcion_id,
                        orden: index
                    }))
                });
            }
        }

        const record = await this.prisma.tipoServicio.findFirst({
            where: { id, negocio_id },
            include: {
                opciones: {
                    include: { opcion_servicio: true }
                }
            }
        });

        if (!record) {
            throw new Error('Tipo de servicio no encontrado');
        }

        return mapTipoServicio(record);
    }

    async eliminar(id: string, negocio_id: string) {
        const deleted = await this.prisma.tipoServicio.deleteMany({
            where: { id, negocio_id }
        });

        if (deleted.count === 0) {
            throw new Error('Tipo de servicio no encontrado');
        }
    }
}
