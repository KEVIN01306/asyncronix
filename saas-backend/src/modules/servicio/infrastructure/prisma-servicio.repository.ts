import type { PrismaClient } from "@prisma/client";
import type { ServicioRepository } from "../domain/servicio.repository.js";
import type { ServicioCrear, ServicioActualizar, ServicioDetalle, ServicioSimple, ImagenServicio, ChecklistRespuestaSimple } from "../domain/servicio.entity.js";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";

const mapServicioSimple = (record: any): ServicioSimple => ({
    id: record.id,
    sucursal_id: record.sucursal_id,
    vehiculo_id: record.vehiculo_id,
    cliente_id: record.cliente_id,
    tipo_servicio_id: record.tipo_servicio_id,
    estado: record.estado,
    total: record.total,
    created_at: record.created_at
});

const mapServicioDetalle = (record: any): ServicioDetalle => ({
    id: record.id,
    negocio_id: record.negocio_id,
    sucursal_id: record.sucursal_id,
    vehiculo_id: record.vehiculo_id,
    mecanico_id: record.mecanico_id,
    cliente_id: record.cliente_id,
    tipo_servicio_id: record.tipo_servicio_id,
    descripcion: record.descripcion,
    diagnostico: record.diagnostico,
    kilometraje: record.kilometraje,
    fecha_entrada: record.fecha_entrada,
    fecha_salida: record.fecha_salida,
    total: record.total,
    estado: record.estado,
    MetodoPago: record.MetodoPago,
    activo: record.activo,
    created_at: record.created_at,
    updated_at: record.updated_at,
    imagenes: (record.imagenes ?? []).map((item: any) => ({
        id: item.id,
        servicio_id: item.servicio_id,
        descripcion: item.descripcion,
        url: item.imagen,
        created_at: item.created_at,
        updated_at: item.updated_at
    })),
    checklist: (record.checklist ?? []).map((item: any) => ({
        id: item.id,
        checklist_item_id: item.checklist_item_id,
        servicio_id: item.servicio_id,
        estado: item.estado,
        observaciones: item.observaciones,
        created_at: item.created_at,
        updated_at: item.updated_at
    }))
});

const mapChecklistRespuesta = (record: any): ChecklistRespuestaSimple => ({
    id: record.id,
    checklist_item_id: record.checklist_item_id,
    servicio_id: record.servicio_id,
    estado: record.estado,
    observaciones: record.observaciones,
    created_at: record.created_at,
    updated_at: record.updated_at
});

export class PrismaServicioRepository implements ServicioRepository {
    constructor(private readonly db: PrismaClient) { }

    async listar(negocio_id: string, page: number, perPage: number) {
        const skip = (page - 1) * perPage;
        try {
            const [total, items] = await Promise.all([
                this.db.servicio.count({ where: { negocio_id, activo: true } }),
                this.db.servicio.findMany({
                    where: { negocio_id, activo: true },
                    skip,
                    take: perPage,
                    orderBy: { created_at: 'desc' }
                })
            ]);
            return { total, data: items.map(mapServicioSimple), page, perPage };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtener(id: string, negocio_id: string) {
        try {
            const record = await this.db.servicio.findFirst({
                where: { id, negocio_id, activo: true },
                include: { imagenes: true, checklist: true }
            });
            if (!record) return null;
            return mapServicioDetalle(record as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async registrar(data: ServicioCrear, negocio_id: string) {
        try {
            const checklistItems = await this.db.checklistItem.findMany({
                where: { negocio_id, activo: true }
            });

            const created = await this.db.servicio.create({
                data: {
                    negocio_id,
                    sucursal_id: data.sucursal_id,
                    vehiculo_id: data.vehiculo_id,
                    mecanico_id: data.mecanico_id ?? null,
                    cliente_id: data.cliente_id ?? null,
                    tipo_servicio_id: data.tipo_servicio_id ?? null,
                    descripcion: data.descripcion ?? null,
                    kilometraje: data.kilometraje ?? null,
                    fecha_salida: data.fecha_salida ? new Date(data.fecha_salida) : null,
                    total: data.total ?? 0,
                    estado: data.estado ?? 'RECEPCION',
                    MetodoPago: data.MetodoPago ?? 'EFECTIVO',
                    checklist: {
                        create: checklistItems.map((item) => ({
                            checklist_item_id: item.id,
                            estado: 'OPTIMO',
                            observaciones: null
                        }))
                    }
                },
                include: { imagenes: true, checklist: true }
            });
            return mapServicioDetalle(created as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizar(id: string, negocio_id: string, data: ServicioActualizar) {
        try {
            const updated = await this.db.servicio.updateMany({
                where: { id, negocio_id, activo: true },
                data: {
                    sucursal_id: data.sucursal_id,
                    vehiculo_id: data.vehiculo_id,
                    mecanico_id: data.mecanico_id ?? undefined,
                    cliente_id: data.cliente_id ?? undefined,
                    tipo_servicio_id: data.tipo_servicio_id ?? undefined,
                    descripcion: data.descripcion ?? undefined,
                    diagnostico: data.diagnostico ?? undefined,
                    kilometraje: data.kilometraje ?? undefined,
                    fecha_salida: data.fecha_salida ? new Date(data.fecha_salida) : undefined,
                    total: data.total ?? undefined,
                    estado: data.estado ?? undefined,
                    MetodoPago: data.MetodoPago ?? undefined
                }
            });

            if (updated.count === 0) throw new Error('Servicio no encontrado');

            const record = await this.db.servicio.findFirst({
                where: { id, negocio_id, activo: true },
                include: { imagenes: true, checklist: true }
            });
            if (!record) throw new Error('Servicio no encontrado');
            return mapServicioDetalle(record as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async cambiarEstado(id: string, negocio_id: string, estado: string) {
        try {
            const updated = await this.db.servicio.updateMany({
                where: { id, negocio_id, activo: true },
                data: { estado }
            });
            if (updated.count === 0) throw new Error('Servicio no encontrado');

            const record = await this.db.servicio.findFirst({
                where: { id, negocio_id, activo: true },
                include: { imagenes: true, checklist: true }
            });
            if (!record) throw new Error('Servicio no encontrado');
            return mapServicioDetalle(record as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async registrarImagen(servicio_id: string, url: string, negocio_id: string, descripcion?: string | null) {
        try {
            const servicio = await this.db.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');

            await this.db.imagen.create({
                data: { servicio_id, imagen: url, descripcion: descripcion ?? null }
            });

            const record = await this.db.servicio.findFirst({
                where: { id: servicio_id, negocio_id, activo: true },
                include: { imagenes: true, checklist: true }
            });
            return mapServicioDetalle(record as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtenerImagen(id: string) {
        try {
            const record = await this.db.imagen.findUnique({ where: { id } });
            if (!record) return null;
            return {
                id: record.id,
                servicio_id: record.servicio_id,
                url: record.imagen,
                created_at: record.created_at,
                updated_at: record.updated_at
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminarImagen(id: string) {
        try {
            await this.db.imagen.delete({ where: { id } });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async listarChecklistRespuestas(servicio_id: string, negocio_id: string) {
        try {
            const servicio = await this.db.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');

            const respuestas = await this.db.checklistRespuesta.findMany({
                where: { servicio_id }
            });
            return respuestas.map(mapChecklistRespuesta);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async registrarChecklistRespuesta(data: Omit<ChecklistRespuestaSimple, 'id' | 'created_at' | 'updated_at'>, negocio_id: string) {
        try {
            const servicio = await this.db.servicio.findFirst({ where: { id: data.servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');

            const created = await this.db.checklistRespuesta.create({
                data: {
                    checklist_item_id: data.checklist_item_id,
                    servicio_id: data.servicio_id,
                    estado: data.estado,
                    observaciones: data.observaciones ?? null
                }
            });
            return mapChecklistRespuesta(created as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizarChecklistRespuesta(id: string, servicio_id: string, negocio_id: string, data: Partial<Omit<ChecklistRespuestaSimple, 'id' | 'servicio_id' | 'created_at' | 'updated_at'>>) {
        try {
            const respuesta = await this.db.checklistRespuesta.findUnique({ where: { id } });
            if (!respuesta || respuesta.servicio_id !== servicio_id) throw new Error('Checklist respuesta no encontrada');

            const servicio = await this.db.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');

            const updated = await this.db.checklistRespuesta.update({
                where: { id },
                data: {
                    checklist_item_id: data.checklist_item_id ?? undefined,
                    estado: data.estado ?? undefined,
                    observaciones: data.observaciones ?? undefined
                }
            });
            return mapChecklistRespuesta(updated as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminarChecklistRespuesta(id: string, servicio_id: string, negocio_id: string) {
        try {
            const respuesta = await this.db.checklistRespuesta.findUnique({ where: { id } });
            if (!respuesta || respuesta.servicio_id !== servicio_id) throw new Error('Checklist respuesta no encontrada');

            const servicio = await this.db.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');

            await this.db.checklistRespuesta.delete({ where: { id } });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
