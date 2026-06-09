import type { PrismaClient } from "@prisma/client";
import type { ServicioRepository, ListarServiciosParams } from "../domain/servicio.repository.js";
import type { ServicioCrear, ServicioActualizar, ServicioDetalle, ServicioSimple, ImagenServicio, ChecklistRespuestaSimple } from "../domain/servicio.entity.js";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";
import { mapServicioSimple, mapServicioDetalle, mapChecklistRespuesta } from "./mappers/servicio.mappers.js";
import { ESTADO_SERVICIO, METODO_PAGO } from "../domain/servicio.constants.js";

export class PrismaServicioRepository implements ServicioRepository {
    constructor(private readonly db: PrismaClient) { }

    async listar(params: ListarServiciosParams) {
        const { negocio_id, page, perPage, estado, placa, codigo, q, mecanico_id, usuario_id, isAdministrador } = params;
        const skip = (page - 1) * perPage;
        const filters: any[] = [{ negocio_id, activo: true }];

        if (isAdministrador) {
            if (mecanico_id) {
                filters.push({ mecanico_id });
            }
        } else if (usuario_id) {
            filters.push({ mecanico_id: usuario_id });
        }

        if (estado) {
            filters.push({ estado });
        }

        if (placa) {
            filters.push({ vehiculo: { placa: { contains: placa } } });
        }

        const orConditions: any[] = [];

        if (codigo) {
            orConditions.push({ id: { contains: codigo } });
        }

        if (q) {
            orConditions.push(
                { id: { contains: q } },
                { descripcion: { contains: q } },
                { vehiculo: { placa: { contains: q } } },
                { cliente: { nombre: { contains: q } } },
                { mecanico: { nombre: { contains: q } } },
                { mecanico: { apellido: { contains: q } } },
                { tipo_servicio: { nombre: { contains: q } } }
            );
        }

        const where: any = { AND: filters };
        if (orConditions.length > 0) {
            where.AND.push({ OR: orConditions });
        }

        try {
            const [total, items] = await Promise.all([
                this.db.servicio.count({ where }),
                this.db.servicio.findMany({
                    where,
                    skip,
                    take: perPage,
                    orderBy: { created_at: 'desc' },
                    include: {
                        vehiculo: { include: { modelo: true } },
                        tipo_servicio: true,
                        cliente: { select: { id: true, nombre: true, telefono: true, email: true, dpi: true } },
                        mecanico: { select: { id: true, nombre: true, apellido: true, email: true } }
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
                include: {
                    imagenes: true,
                    checklist: { include: { checklist_item: { select: { id: true, nombre: true } } } },
                    tareas: true,
                    cliente: { select: { id: true, nombre: true, telefono: true, email: true, dpi: true } },
                    vehiculo: { include: { modelo: true } },
                    tipo_servicio: { include: { opciones: { include: { opcion_servicio: true } } } },
                    mecanico: { select: { id: true, nombre: true, apellido: true, email: true } },
                    ServicioRepuestoCliente: true,
                    repuestos: { include: { lote: { include: { variante: { include: { producto: true } } } } } }
                }
            });
            if (!record) return null;
            return mapServicioDetalle(record as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtenerEstado(id: string, negocio_id: string) {
        try {
            const record = await this.db.servicio.findFirst({
                where: { id, negocio_id, activo: true },
                select: { id: true, estado: true }
            });
            return record ? { id: record.id, estado: record.estado } : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async listarRepuestosCliente(servicio_id: string, negocio_id: string) {
        try {
            const servicio = await this.db.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');
            const items = await this.db.servicioRepuestoCliente.findMany({ where: { servicio_id } });
            return items as any;
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
                    kilometraje_proximo: data.kilometraje_proximo ?? null,
                    fecha_salida: data.fecha_salida ? new Date(data.fecha_salida) : null,
                    diagnostico: data.diagnostico ?? null,
                    total: data.total ?? 0,
                    estado: data.estado ? data.estado as any : ESTADO_SERVICIO.RECEPCION,
                    MetodoPago: data.MetodoPago ?? METODO_PAGO.EFECTIVO,
                    checklist: tipoServicio?.checklist ? {
                        create: checklistItems.map((item) => ({
                            checklist_item_id: item.id,
                            estado: 'OPTIMO',
                            observaciones: null
                        }))
                    } : undefined,
                    tareas: tipoServicio?.opciones?.length ? {
                        create: tipoServicio.opciones.map((item) => ({
                            nombre: item.opcion_servicio.nombre,
                            completado: false,
                            observacion: null
                        }))
                    } : undefined
                } as any,
                include: { imagenes: true, checklist: { include: { checklist_item: { select: { id: true, nombre: true } } } }, tareas: true, cliente: { select: { id: true, nombre: true, telefono: true, email: true } }, vehiculo: { include: { modelo: true } }, tipo_servicio: true, mecanico: { select: { id: true, nombre: true, apellido: true, email: true } } }
            });
            return mapServicioDetalle(created as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async crearTarea(servicio_id: string, data: { nombre: string }, negocio_id: string) {
        try {
            const servicio = await this.db.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');

            const tarea = await this.db.servicioTarea.create({
                data: {
                    servicio_id,
                    nombre: data.nombre,
                    completado: false,
                    observacion: null
                }
            });

            return tarea as any;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminarTarea(id: string, servicio_id: string, negocio_id: string) {
        try {
            const servicio = await this.db.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');

            const deleted = await this.db.servicioTarea.deleteMany({ where: { id, servicio_id } });
            if (deleted.count === 0) throw new Error('Tarea no encontrada');
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizarChecklistRespuestasPorTipoServicio(servicio_id: string, tipo_servicio_id: string | null, negocio_id: string) {
        try {
            const servicio = await this.db.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');

            if (!tipo_servicio_id) {
                await this.db.checklistRespuesta.deleteMany({ where: { servicio_id } });
                return;
            }

            const tipoServicio = await this.db.tipoServicio.findFirst({ where: { id: tipo_servicio_id, negocio_id, activo: true } });
            if (!tipoServicio) throw new Error('Tipo de servicio no encontrado');

            if (!tipoServicio.checklist) {
                await this.db.checklistRespuesta.deleteMany({ where: { servicio_id } });
                return;
            }

            const checklistItems = await this.db.checklistItem.findMany({ where: { negocio_id, activo: true } });
            if (checklistItems.length === 0) return;

            await this.db.checklistRespuesta.createMany({
                data: checklistItems.map((item) => ({
                    servicio_id,
                    checklist_item_id: item.id,
                    estado: 'OPTIMO',
                    observaciones: null
                })),
                skipDuplicates: true
            });
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
                    diagnostico: data.diagnostico ?? null,
                    kilometraje: data.kilometraje ?? undefined,
                    kilometraje_proximo: data.kilometraje_proximo ?? undefined,
                    fecha_salida: data.fecha_salida ? new Date(data.fecha_salida) : undefined,
                    firma_salida: data.firma_salida ?? undefined,
                    total: data.total ?? undefined,
                    estado: data.estado ? data.estado as any : undefined,
                    MetodoPago: data.MetodoPago ?? undefined
                } as any
            });

            if (updated.count === 0) throw new Error('Servicio no encontrado');

            const record = await this.db.servicio.findFirst({
                where: { id, negocio_id, activo: true },
                include: { imagenes: true, checklist: { include: { checklist_item: { select: { id: true, nombre: true } } } }, tareas: true, mecanico: { select: { id: true, nombre: true, apellido: true, email: true } }, tipo_servicio: true, vehiculo: { include: { modelo: true } } }
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
                data: { estado: estado as any } as any
            });
            if (updated.count === 0) throw new Error('Servicio no encontrado');

            const record = await this.db.servicio.findFirst({
                where: { id, negocio_id, activo: true },
                include: { imagenes: true, checklist: { include: { checklist_item: { select: { id: true, nombre: true } } } }, tareas: true, mecanico: { select: { id: true, nombre: true, apellido: true, email: true } }, tipo_servicio: true, vehiculo: { include: { modelo: true } } }
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
                include: { imagenes: true, checklist: { include: { checklist_item: { select: { id: true, nombre: true } } } }, tareas: true, mecanico: { select: { id: true, nombre: true, apellido: true, email: true } }, tipo_servicio: true }
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
            if (!([ESTADO_SERVICIO.EN_SERVICIO, ESTADO_SERVICIO.ESPERA_REPUESTOS] as string[]).includes(servicio.estado)) {
                throw new Error('No se pueden agregar imágenes desde progreso en este estado');
            }

            const descripcionFinal = `EN_PROGRESO: ${descripcion?.trim() || ''}`.trim();

            await this.db.imagen.create({
                data: { servicio_id, imagen: url, descripcion: descripcionFinal }
            });

            const record = await this.db.servicio.findFirst({
                where: { id: servicio_id, negocio_id, activo: true },
                include: { imagenes: true, checklist: { include: { checklist_item: { select: { id: true, nombre: true } } } }, tareas: true, mecanico: { select: { id: true, nombre: true, apellido: true, email: true } }, tipo_servicio: true }
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
                include: { imagenes: true, checklist: { include: { checklist_item: { select: { id: true, nombre: true } } } }, tareas: true, mecanico: { select: { id: true, nombre: true, apellido: true, email: true } }, tipo_servicio: true }
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
            if (!([ESTADO_SERVICIO.EN_SERVICIO, ESTADO_SERVICIO.ESPERA_REPUESTOS] as string[]).includes(servicio.estado)) {
                throw new Error('No se pueden editar tareas en este estado');
            }

            await this.db.servicioTarea.update({
                where: { id },
                data: {
                    nombre: data.nombre ?? undefined,
                    completado: data.completado ?? undefined,
                    observacion: data.observacion ?? undefined
                } as any
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
                where: { servicio_id },
                include: { checklist_item: { select: { id: true, nombre: true } } }
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
                    estado: data.estado as any,
                    observaciones: data.observaciones ?? null
                },
                include: { checklist_item: { select: { id: true, nombre: true } } }
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
                    estado: data.estado ? data.estado as any : undefined,
                    observaciones: data.observaciones ?? undefined
                } as any,
                include: { checklist_item: { select: { id: true, nombre: true } } }
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
                include: { imagenes: true, checklist: { include: { checklist_item: { select: { id: true, nombre: true } } } }, tareas: true, tipo_servicio: true }
            });
            return mapServicioDetalle(updated as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizarClienteExterno(servicio_id: string, negocio_id: string, data: { nombre_extra: string; documento_extra: string; numero_extra: string }) {
        try {
            const servicio = await this.db.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');
            if (servicio.estado !== ESTADO_SERVICIO.RECEPCION) throw new Error('El servicio no está en estado RECEPCION');

            const updated = await this.db.servicio.update({
                where: { id: servicio_id },
                data: {
                    nombre_extra: data.nombre_extra,
                    documento_extra: data.documento_extra,
                    numero_extra: data.numero_extra
                },
                include: { imagenes: true, checklist: { include: { checklist_item: { select: { id: true, nombre: true } } } }, tareas: true, cliente: true, vehiculo: true, tipo_servicio: true, mecanico: { select: { id: true, nombre: true, apellido: true, email: true } } }
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
                include: { imagenes: true, checklist: { include: { checklist_item: { select: { id: true, nombre: true } } } }, tareas: true, cliente: true, vehiculo: true, tipo_servicio: true, mecanico: { select: { id: true, nombre: true, apellido: true, email: true } } }
            });
            return mapServicioDetalle(updated as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async registrarRepuestoCliente(data: any, servicio_id: string, negocio_id: string) {
        try {
            const servicio = await this.db.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');
            if (servicio.estado !== ESTADO_SERVICIO.RECEPCION) throw new Error('No se pueden crear repuestos en este estado');

            const created = await this.db.servicioRepuestoCliente.create({
                data: {
                    servicio_id,
                    repuesto: data.repuesto,
                    cantidad: data.cantidad
                }
            });
            return created as any;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async crearRepuesto(servicio_id: string, detalle: any, negocio_id: string, sucursal_id: string) {
        try {
            const servicio = await this.db.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');

            const created = await this.db.servicioRepuesto.create({
                data: {
                    servicio_id,
                    variante_id: detalle.variante_id ?? undefined,
                    lote_id: detalle.lote_id ?? undefined,
                    cantidad: detalle.cantidad,
                    precio_venta: detalle.precio_venta,
                    costo: detalle.costo_unitario ?? undefined
                },
                include: { lote: { include: { variante: { include: { producto: true } } } } }
            });

            // Recalculate total for servicio based on repuestos
            //const detalles = await this.db.servicioRepuesto.findMany({ where: { servicio_id } });
            //const total = detalles.reduce((s: number, d: any) => s + (d.precio_venta * d.cantidad), 0);
            //await this.db.servicio.update({ where: { id: servicio_id }, data: { total } });

            return created;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async crearRepuestosAtomicos(servicio_id: string, detalles: any[], negocio_id: string, sucursal_id: string) {
        try {
            return await this.db.$transaction(async (tx) => {
                const servicio = await tx.servicio.findFirst({ where: { id: servicio_id, negocio_id, sucursal_id, activo: true } });
                if (!servicio) throw new Error('Servicio no encontrado');

                const created: any[] = [];

                for (const d of detalles) {
                    if (!d.lote_id) {
                        throw new Error('LOTE_REQUERIDO');
                    }

                    const loteRecord = await tx.lote.findFirst({ where: { id: d.lote_id, negocio_id } });
                    if (!loteRecord) throw new Error('LOTE_NO_ENCONTRADO');
                    const actual = loteRecord.cantidad_actual ?? 0;
                    if (actual < d.cantidad) throw new Error('INSUFICIENTE_STOCK');

                    const c = await tx.servicioRepuesto.create({ data: { servicio_id, variante_id: d.variante_id ?? undefined, lote_id: d.lote_id, cantidad: d.cantidad, precio_venta: d.precio_venta, costo: d.costo_unitario }, include: { lote: { include: { variante: { include: { producto: true } } } } } });
                    created.push(c);
                }

                //const detallesServicio = await tx.servicioRepuesto.findMany({ where: { servicio_id } });
                //const total = detallesServicio.reduce((s: number, d: any) => s + (d.precio_venta * d.cantidad), 0);
                //await tx.servicio.update({ where: { id: servicio_id }, data: { total } });

                return created;
            }, {
                timeout: 10000,
            } );
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminarRepuestoCliente(id: string, servicio_id: string, negocio_id: string) {
        try {
            const servicio = await this.db.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');
            if (servicio.estado !== ESTADO_SERVICIO.RECEPCION) throw new Error('No se pueden eliminar repuestos en este estado');

            const rep = await this.db.servicioRepuestoCliente.findUnique({ where: { id } });
            if (!rep || rep.servicio_id !== servicio_id) throw new Error('Repuesto no encontrado');

            await this.db.servicioRepuestoCliente.delete({ where: { id } });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminarRepuesto(id: string, servicio_id: string, negocio_id: string, sucursal_id: string) {
        try {
            const servicio = await this.db.servicio.findFirst({ where: { id: servicio_id, negocio_id, sucursal_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');

            const rep = await this.db.servicioRepuesto.findFirst({ where: { id, servicio_id } });
            if (!rep) throw new Error('Repuesto no encontrado');

            await this.db.servicioRepuesto.delete({ where: { id } });

            //const detalles = await this.db.servicioRepuesto.findMany({ where: { servicio_id } });
            //const total = detalles.reduce((s: number, d: any) => s + (d.precio_venta * d.cantidad), 0);
            //await this.db.servicio.update({ where: { id: servicio_id }, data: { total } });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminarTareas(servicio_id: string, negocio_id: string) {
        try {
            const servicio = await this.db.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');

            await this.db.servicioTarea.deleteMany({ where: { servicio_id } });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async crearTareasDesdeTipoServicio(servicio_id: string, tipo_servicio_id: string | null, negocio_id: string) {
        try {
            if (!tipo_servicio_id) return;

            const tipoServicio = await this.db.tipoServicio.findFirst({ where: { id: tipo_servicio_id, negocio_id, activo: true }, include: { opciones: { include: { opcion_servicio: true } } } });
            if (!tipoServicio) throw new Error('Tipo de servicio no encontrado');

            const tareasData = (tipoServicio.opciones ?? []).map((op) => ({ servicio_id, nombre: op.opcion_servicio.nombre, completado: false, observacion: null }));
            if (tareasData.length === 0) return;

            // createMany may ignore duplicates; use create for safety in case of DB constraints
            await this.db.servicioTarea.createMany({ data: tareasData });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizarObservaciones(id: string, negocio_id: string, observaciones: string | null) {
        try {
            const updated = await this.db.servicio.update({
                where: { id, negocio_id, activo: true },
                data: { observaciones },
                include: { imagenes: true, checklist: { include: { checklist_item: { select: { id: true, nombre: true } } } }, tareas: true, cliente: true, vehiculo: true, tipo_servicio: true, mecanico: { select: { id: true, nombre: true, apellido: true, email: true } } }
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
                include: { imagenes: true, checklist: { include: { checklist_item: { select: { id: true, nombre: true } } } }, tareas: true, cliente: true, vehiculo: true, tipo_servicio: true, mecanico: { select: { id: true, nombre: true, apellido: true, email: true } } }
            });
            return mapServicioDetalle(updated as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
