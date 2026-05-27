import type { PrismaClient } from "@prisma/client";
import type { ServicioRepository } from "../domain/servicio.repository.js";
import type { ServicioCrear, ServicioActualizar, ServicioDetalle, ServicioSimple, ImagenServicio, ChecklistRespuestaSimple } from "../domain/servicio.entity.js";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";
import { mapServicioSimple, mapServicioDetalle, mapChecklistRespuesta } from "./mappers/servicio.mappers.js";
import { ESTADO_SERVICIO, METODO_PAGO } from "../domain/servicio.constants.js";

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
                    orderBy: { created_at: 'desc' },
                    include: {
                        vehiculo: { include: { modelo: true } },
                        tipo_servicio: true
                    }
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
                include: { imagenes: true, checklist: true, tareas: true, cliente: { select: { id: true, nombre: true, telefono: true, email: true } }, vehiculo: { include: { modelo: true } }, tipo_servicio: true, mecanico: { select: { id: true, nombre: true, apellido: true, email: true } } }
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

            const tipoServicio = data.tipo_servicio_id ? await this.db.tipoServicio.findFirst({
                where: { id: data.tipo_servicio_id, negocio_id, activo: true },
                include: { opciones: { include: { opcion_servicio: true } } }
            }) : null;

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
                    estado: data.estado ?? ESTADO_SERVICIO.RECEPCION,
                    MetodoPago: data.MetodoPago ?? METODO_PAGO.EFECTIVO,
                    checklist: {
                        create: checklistItems.map((item) => ({
                            checklist_item_id: item.id,
                            estado: 'OPTIMO',
                            observaciones: null
                        }))
                    },
                    tareas: tipoServicio ? {
                        create: tipoServicio.opciones.map((item) => ({
                            nombre: item.opcion_servicio.nombre,
                            completado: false,
                            observacion: null
                        }))
                    } : undefined
                },
                include: { imagenes: true, checklist: true, tareas: true, cliente: { select: { id: true, nombre: true, telefono: true, email: true } }, vehiculo: { include: { modelo: true } }, tipo_servicio: true, mecanico: { select: { id: true, nombre: true, apellido: true, email: true } } }
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
                include: { imagenes: true, checklist: true, tareas: true, mecanico: { select: { id: true, nombre: true, apellido: true, email: true } } }
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
                include: { imagenes: true, checklist: true, tareas: true, mecanico: { select: { id: true, nombre: true, apellido: true, email: true } } }
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
            if (servicio.estado !== ESTADO_SERVICIO.RECEPCION) throw new Error('No se pueden agregar imágenes en estados diferentes a RECEPCION');

            await this.db.imagen.create({
                data: { servicio_id, imagen: url, descripcion: descripcion ?? null }
            });

            const record = await this.db.servicio.findFirst({
                where: { id: servicio_id, negocio_id, activo: true },
                include: { imagenes: true, checklist: true, tareas: true, mecanico: { select: { id: true, nombre: true, apellido: true, email: true } } }
            });
            return mapServicioDetalle(record as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async registrarImagenProgreso(servicio_id: string, url: string, negocio_id: string, descripcion?: string | null) {
        try {
            const servicio = await this.db.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');
            if (![ESTADO_SERVICIO.EN_SERVICIO, ESTADO_SERVICIO.ESPERA_REPUESTOS].includes(servicio.estado)) {
                throw new Error('No se pueden agregar imágenes desde progreso en este estado');
            }

            const descripcionFinal = `EN_PROGRESO: ${descripcion?.trim() || ''}`.trim();

            await this.db.imagen.create({
                data: { servicio_id, imagen: url, descripcion: descripcionFinal }
            });

            const record = await this.db.servicio.findFirst({
                where: { id: servicio_id, negocio_id, activo: true },
                include: { imagenes: true, checklist: true, tareas: true, mecanico: { select: { id: true, nombre: true, apellido: true, email: true } } }
            });
            return mapServicioDetalle(record as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async guardarFirmaEntrada(servicio_id: string, firma_url: string, negocio_id: string) {
        try {
            const servicio = await this.db.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');
            if (servicio.estado !== ESTADO_SERVICIO.RECEPCION) throw new Error('El servicio no está en estado RECEPCION');

            const updated = await this.db.servicio.update({
                where: { id: servicio_id },
                data: {
                    firma_entrada: firma_url,
                    estado: ESTADO_SERVICIO.EN_SERVICIO
                },
                include: { imagenes: true, checklist: true, tareas: true, mecanico: { select: { id: true, nombre: true, apellido: true, email: true } } }
            });
            return mapServicioDetalle(updated as any);
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

    async eliminarImagen(id: string, negocio_id: string) {
        try {
            const imagen = await this.db.imagen.findUnique({ where: { id } });
            if (!imagen) throw new Error('Imagen no encontrada');

            const servicio = await this.db.servicio.findFirst({ where: { id: imagen.servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');
            if (servicio.estado !== ESTADO_SERVICIO.RECEPCION) throw new Error('No se pueden eliminar imágenes en estados diferentes a RECEPCION');

            await this.db.imagen.delete({ where: { id } });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizarTarea(id: string, servicio_id: string, negocio_id: string, data: { nombre?: string; completado?: boolean; observacion?: string | null }) {
        try {
            const tarea = await this.db.servicioTarea.findUnique({ where: { id } });
            if (!tarea || tarea.servicio_id !== servicio_id) throw new Error('Tarea no encontrada');

            const servicio = await this.db.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');
            if (![ESTADO_SERVICIO.EN_SERVICIO, ESTADO_SERVICIO.ESPERA_REPUESTOS].includes(servicio.estado)) {
                throw new Error('No se pueden editar tareas en este estado');
            }

            await this.db.servicioTarea.update({
                where: { id },
                data: {
                    nombre: data.nombre ?? undefined,
                    completado: data.completado ?? undefined,
                    observacion: data.observacion ?? undefined
                }
            });
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
            if (servicio.estado !== ESTADO_SERVICIO.RECEPCION) throw new Error('No se pueden registrar respuestas de checklist en estados diferentes a RECEPCION');

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
            if (servicio.estado !== ESTADO_SERVICIO.RECEPCION) throw new Error('No se puede editar el checklist en estados diferentes a RECEPCION');

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
            if (servicio.estado !== ESTADO_SERVICIO.RECEPCION) throw new Error('No se puede eliminar elementos del checklist en estados diferentes a RECEPCION');

            await this.db.checklistRespuesta.delete({ where: { id } });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async asociarCliente(servicio_id: string, negocio_id: string) {
        try {
            const servicio = await this.db.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');

            const vehiculo = await this.db.vehiculo.findFirst({ where: { id: servicio.vehiculo_id, negocio_id, activo: true } });
            if (!vehiculo) throw new Error('Vehículo no encontrado');
            if (!vehiculo.cliente_id) throw new Error('El vehículo no tiene un cliente asociado');

            const updated = await this.db.servicio.update({
                where: { id: servicio_id },
                data: { cliente_id: vehiculo.cliente_id },
                include: { imagenes: true, checklist: true, tareas: true }
            });
            return mapServicioDetalle(updated as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async asociarMecanico(servicio_id: string, mecanico_id: string, negocio_id: string) {
        try {
            const servicio = await this.db.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');

            const updated = await this.db.servicio.update({
                where: { id: servicio_id },
                data: { mecanico_id },
                include: { imagenes: true, checklist: true, tareas: true, cliente: true, vehiculo: true, tipo_servicio: true, mecanico: { select: { id: true, nombre: true, apellido: true, email: true } } }
            });
            return mapServicioDetalle(updated as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async cambiarMecanico(servicio_id: string, mecanicoAnteriorId: string, mecanicoNuevoId: string, negocio_id: string) {
        try {
            const servicio = await this.db.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');

            // validate mecanicoAnteriorId if provided: only ensure it's present in request as per requirements

            const updated = await this.db.servicio.update({
                where: { id: servicio_id },
                data: { mecanico_id: mecanicoNuevoId },
                include: { imagenes: true, checklist: true, tareas: true, cliente: true, vehiculo: true, tipo_servicio: true, mecanico: { select: { id: true, nombre: true, apellido: true, email: true } } }
            });
            return mapServicioDetalle(updated as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
