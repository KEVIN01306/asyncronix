import type { PrismaClient } from "@prisma/client";
import type { ServicioRepository, ListarServiciosParams } from "../domain/servicio.repository.js";
import type { ServicioCrear, ServicioActualizar, ServicioDetalle, ServicioSimple, ImagenServicio, ChecklistRespuestaSimple } from "../domain/servicio.entity.js";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";
import { mapServicioVehiculoToServicioSimple, mapServicioVehiculoToServicioDetalle, toServicioRecordFromServicioVehiculo } from "./mappers/servicio-vehiculo.mappers.js";

// This repository is a compatibility facade that currently delegates to the
// existing `PrismaServicioRepository`. It provides a single place to implement
// future persistence changes that rely on the `ServicioVehiculo` model while
// keeping the same `ServicioRepository` interface.
export class PrismaServicioVehiculoRepository implements ServicioRepository {

    constructor(private readonly prisma: PrismaClient) {   }

    // Delegate methods to the existing implementation for now.
    async listar(params: ListarServiciosParams) {
        const { negocio_id, page, perPage, estado, placa, codigo, q, mecanico_id, usuario_id, isAdministrador } = params;
        const skip = (page - 1) * perPage;

        const filters: any = { servicio: { negocio_id, activo: true } };

        if (isAdministrador) {
            if (mecanico_id) filters.mecanico_id = mecanico_id;
        } else if (usuario_id) {
            filters.mecanico_id = usuario_id;
        }

        if (estado) filters.estado = estado;

        const orConditions: any[] = [];
        if (codigo) orConditions.push({ servicio: { id: { contains: codigo } } });
        if (q) {
            orConditions.push(
                { servicio: { id: { contains: q } } },
                { servicio: { descripcion: { contains: q } } },
                { vehiculo: { placa: { contains: q } } },
                { vehiculo: { modelo: { modelo: { contains: q } } } },
                { servicio: { cliente: { nombre: { contains: q } } } },
                { mecanico: { nombre: { contains: q } } },
                { mecanico: { apellido: { contains: q } } },
                { servicio: { tipo_servicio: { nombre: { contains: q } } } }
            );
        }

        if (placa) filters.vehiculo = { placa: { contains: placa } };

        const where: any = { AND: [filters] };
        if (orConditions.length) where.AND.push({ OR: orConditions });

        try {
            const [total, items] = await Promise.all([
                this.prisma.servicioVehiculo.count({ where }),
                this.prisma.servicioVehiculo.findMany({
                    where,
                    skip,
                    take: perPage,
                    orderBy: { created_at: 'desc' },
                    include: {
                        servicio: { include: { tipo_servicio: true, cliente: { select: { id: true, nombre: true, telefono: true, email: true, dpi: true } }, imagenes: true, checklist: true, tareas: true, ServicioRepuestoCliente: true, repuestos: true } },
                        vehiculo: { include: { modelo: true } },
                        mecanico: { select: { id: true, nombre: true, apellido: true, email: true } }
                    }
                })
            ]);

            return { total, data: items.map(mapServicioVehiculoToServicioSimple), page, perPage };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtener(id: string, negocio_id: string) {
        try {
            // Prefer to fetch from ServicioVehiculo by servicio_id
            const record = await this.prisma.servicioVehiculo.findFirst({
                where: { servicio_id: id, servicio: { negocio_id, activo: true } },
                include: {
                    servicio: { include: { imagenes: true, checklist: { include: { checklist_item: { select: { id: true, nombre: true } } } }, tareas: true, CambiosSiguienteServicio: true, cliente: { select: { id: true, nombre: true, telefono: true, email: true, dpi: true } }, tipo_servicio: { include: { opciones: { include: { opcion_servicio: true } } } }, ServicioRepuestoCliente: true, repuestos: { include: { variante: { include: { producto: true, valores: { include: { atributo: true } } } } } } } },
                    vehiculo: { include: { modelo: true } },
                    mecanico: { select: { id: true, nombre: true, apellido: true, email: true } }
                }
            });

            return mapServicioVehiculoToServicioDetalle(record as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtenerEstado(id: string, negocio_id: string) {
        try {
            const servicio = await this.prisma.servicio.findFirst({ where: { id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');

            const sv = await this.prisma.servicioVehiculo.findFirst({ 
                where: { servicio_id: id },
                select: { servicio_id: true, estado: true }
            });

            if (!sv) throw new Error('ServicioVehiculo no encontrado');
            return { id: sv.servicio_id, estado: sv.estado } as any;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async listarRepuestosCliente(servicio_id: string, negocio_id: string) {
        try {
            const servicio = await this.prisma.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');
            const items = await this.prisma.servicioRepuestoCliente.findMany({ where: { servicio_id } });
            return items as any;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async registrar(data: ServicioCrear, negocio_id: string, recepcionista_id: string, options?: { tx?: any }) {
        const db = options?.tx || this.prisma;
        try {
            // create servicio as before
            const checklistItems = await db.checklistItem.findMany({ where: { negocio_id, activo: true } });

            const tipoServicio = data.tipo_servicio_id ? await db.tipoServicio.findFirst({ where: { id: data.tipo_servicio_id, negocio_id, activo: true }, include: { opciones: { include: { opcion_servicio: true } } } }) : null;

            const created = await db.servicio.create({
                data: {
                    negocio_id,
                    sucursal_id: data.sucursal_id,
                    cliente_id: data.cliente_id ?? null,
                    tipo_servicio_id: data.tipo_servicio_id ?? null,
                    recepcionista_id,
                    descripcion: data.descripcion ?? null,
                    fecha_salida: data.fecha_salida ? new Date(data.fecha_salida) : null,
                    diagnostico: data.diagnostico ?? null,
                    total: data.total ?? 0,
                    MetodoPago: data.MetodoPago ?? undefined,
                    checklist: tipoServicio?.checklist ? {
                        create: checklistItems.map((item) => ({ checklist_item_id: item.id, estado: 'OPTIMO', observaciones: null }))
                    } : undefined,
                    tareas: tipoServicio?.opciones?.length ? { create: tipoServicio.opciones.map((item) => ({ nombre: item.opcion_servicio.nombre, completado: false, observacion: null, extra: false })) } : undefined
                } as any
            });

            // create servicioVehiculo record linked to servicio
            await (db.servicioVehiculo.upsert as any)({
                where: { servicio_id: created.id },
                update: {
                    vehiculo_id: data.vehiculo_id,
                    mecanico_id: data.mecanico_id ?? null,
                    kilometraje: data.kilometraje ?? 0,
                    proximoKilometraje: data.kilometraje_proximo ?? null,
                    estado: (data.estado ?? undefined) as any
                },
                create: {
                    servicio_id: created.id,
                    vehiculo_id: data.vehiculo_id,
                    mecanico_id: data.mecanico_id ?? null,
                    kilometraje: data.kilometraje ?? 0,
                    proximoKilometraje: data.kilometraje_proximo ?? null,
                    estado: (data.estado ?? undefined) as any
                }
            });

            // fetch merged record from servicioVehiculo which includes servicio and vehiculo/mecanico
            const sv = await db.servicioVehiculo.findFirst({ where: { servicio_id: created.id }, include: { servicio: { include: { imagenes: true, checklist: { include: { checklist_item: { select: { id: true, nombre: true } } } }, tareas: true, cliente: { select: { id: true, nombre: true, telefono: true, email: true, dpi: true } }, tipo_servicio: true } }, vehiculo: { include: { modelo: true } }, mecanico: { select: { id: true, nombre: true, apellido: true, email: true } } } } as any);

            return mapServicioVehiculoToServicioDetalle(sv as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async crearTarea(servicio_id: string, data: { nombre: string; extra?: boolean }, negocio_id: string) {
        try {
            const servicio = await this.prisma.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');

            const tarea = await this.prisma.servicioTarea.create({ data: { servicio_id, nombre: data.nombre, completado: false, observacion: null, extra: data.extra ?? false } });
            return tarea as any;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminarTarea(id: string, servicio_id: string, negocio_id: string) {
        try {
            const servicio = await this.prisma.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');

            const deleted = await this.prisma.servicioTarea.deleteMany({ where: { id, servicio_id } });
            if (deleted.count === 0) throw new Error('Tarea no encontrada');
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizarChecklistRespuestasPorTipoServicio(servicio_id: string, tipo_servicio_id: string | null, negocio_id: string) {
        try {
            const servicio = await this.prisma.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');

            if (!tipo_servicio_id) {
                await this.prisma.checklistRespuesta.deleteMany({ where: { servicio_id } });
                return;
            }

            const tipoServicio = await this.prisma.tipoServicio.findFirst({ where: { id: tipo_servicio_id, negocio_id, activo: true } });
            if (!tipoServicio) throw new Error('Tipo de servicio no encontrado');

            if (!tipoServicio.checklist) {
                await this.prisma.checklistRespuesta.deleteMany({ where: { servicio_id } });
                return;
            }

            const checklistItems = await this.prisma.checklistItem.findMany({ where: { negocio_id, activo: true } });
            if (checklistItems.length === 0) return;

            await this.prisma.checklistRespuesta.createMany({
                data: checklistItems.map((item) => ({ servicio_id, checklist_item_id: item.id, estado: 'OPTIMO', observaciones: null })),
                skipDuplicates: true
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizar(id: string, negocio_id: string, data: ServicioActualizar, options?: { tx?: any }) {
        try {
            const tx = options?.tx || this.prisma;
            const currentServicio = await tx.servicio.findFirst({ where: { id, negocio_id, activo: true } });
            if (!currentServicio) throw new Error('Servicio no encontrado');

            const servicioData: any = {
                sucursal_id: data.sucursal_id ?? undefined,
                cliente_id: data.cliente_id ?? undefined,
                tipo_servicio_id: data.tipo_servicio_id ?? undefined,
                descripcion: data.descripcion ?? undefined,
                diagnostico: data.diagnostico ?? null,
                fecha_salida: data.fecha_salida ? new Date(data.fecha_salida) : undefined,
                firma_salida: data.firma_salida ?? undefined,
                total: data.total ?? undefined,
                efectivo_recibido: data.efectivo_recibido ?? undefined,
                vuelto: data.vuelto ?? undefined,
                MetodoPago: data.MetodoPago ?? undefined
            };

            await tx.servicio.update({ where: { id }, data: servicioData });

            const servicioVehiculoData: any = {};
            if (data.vehiculo_id !== undefined) servicioVehiculoData.vehiculo_id = data.vehiculo_id;
            if (data.mecanico_id !== undefined) servicioVehiculoData.mecanico_id = data.mecanico_id;
            if (data.kilometraje !== undefined) servicioVehiculoData.kilometraje = data.kilometraje;
            if (data.kilometraje_proximo !== undefined) servicioVehiculoData.proximoKilometraje = data.kilometraje_proximo;
            if (data.estado !== undefined) servicioVehiculoData.estado = data.estado as any;

            if (Object.keys(servicioVehiculoData).length > 0) {
                await tx.servicioVehiculo.update({ where: { servicio_id: id }, data: servicioVehiculoData });
            }

            const sv = await tx.servicioVehiculo.findFirst({ where: { servicio_id: id }, include: { servicio: { include: { imagenes: true, checklist: { include: { checklist_item: { select: { id: true, nombre: true } } } }, tareas: true, cliente: { select: { id: true, nombre: true, telefono: true, email: true, dpi: true } }, tipo_servicio: true } }, vehiculo: { include: { modelo: true } }, mecanico: { select: { id: true, nombre: true, apellido: true, email: true } } } });
            if (!sv) throw new Error('Servicio no encontrado');
            return mapServicioVehiculoToServicioDetalle(sv as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async cambiarEstado(id: string, negocio_id: string, estado: string) {
        try {
            const sv = await this.prisma.servicioVehiculo.findFirst({ where: { servicio_id: id }, include: { servicio: { include: { imagenes: true, checklist: { include: { checklist_item: { select: { id: true, nombre: true } } } }, tareas: true, cliente: { select: { id: true, nombre: true, telefono: true, email: true, dpi: true } }, tipo_servicio: true } }, vehiculo: { include: { modelo: true } }, mecanico: { select: { id: true, nombre: true, apellido: true, email: true } } } });
            if (!sv) throw new Error('Servicio no encontrado');

            await this.prisma.servicioVehiculo.update({ where: { servicio_id: id }, data: { estado: estado as any } as any });

            const svAfter = await this.prisma.servicioVehiculo.findFirst({ where: { servicio_id: id }, include: { servicio: { include: { imagenes: true, checklist: { include: { checklist_item: { select: { id: true, nombre: true } } } }, tareas: true, cliente: { select: { id: true, nombre: true, telefono: true, email: true, dpi: true } }, tipo_servicio: true } }, vehiculo: { include: { modelo: true } }, mecanico: { select: { id: true, nombre: true, apellido: true, email: true } } } });
            if (!svAfter) throw new Error('Servicio no encontrado');
            return mapServicioVehiculoToServicioDetalle(svAfter as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async registrarImagen(servicio_id: string, url: string, negocio_id: string, descripcion?: string | null) {
        try {
            // check estado from servicioVehiculo if exists
            const sv = await this.prisma.servicioVehiculo.findFirst({ where: { servicio_id: servicio_id } });
            const servicio = await this.prisma.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');
            const estado = sv?.estado ?? (servicio as any).estado;
            if (estado !== 'RECEPCION') throw new Error('No se pueden agregar imágenes en estados diferentes a RECEPCION');

            await this.prisma.imagen.create({ data: { servicio_id, imagen: url, descripcion: descripcion ?? null } });

            const svInclude = {
                servicio: { include: { imagenes: true, checklist: { include: { checklist_item: { select: { id: true, nombre: true } } } }, tareas: true, cliente: { select: { id: true, nombre: true, telefono: true, email: true, dpi: true } }, tipo_servicio: true } },
                vehiculo: { include: { modelo: true } },
                mecanico: { select: { id: true, nombre: true, apellido: true, email: true } }
            } as any;
            const svFull = await this.prisma.servicioVehiculo.findFirst({ where: { servicio_id }, include: svInclude } as any);
            return mapServicioVehiculoToServicioDetalle(svFull as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async registrarImagenProgreso(servicio_id: string, url: string, negocio_id: string, descripcion?: string | null) {
        try {
            const sv = await this.prisma.servicioVehiculo.findFirst({ where: { servicio_id: servicio_id } });
            const servicio = await this.prisma.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');
            const estado = sv?.estado ?? (servicio as any).estado;
            if (!(['EN_SERVICIO', 'ESPERA_REPUESTOS'] as string[]).includes(estado)) throw new Error('No se pueden agregar imágenes desde progreso en este estado');

            const descripcionFinal = `EN_PROGRESO: ${descripcion?.trim() || ''}`.trim();

            await this.prisma.imagen.create({ data: { servicio_id, imagen: url, descripcion: descripcionFinal } });

            const svInclude2 = {
                servicio: { include: { imagenes: true, checklist: { include: { checklist_item: { select: { id: true, nombre: true } } } }, tareas: true, cliente: { select: { id: true, nombre: true, telefono: true, email: true, dpi: true } }, tipo_servicio: true } },
                vehiculo: { include: { modelo: true } },
                mecanico: { select: { id: true, nombre: true, apellido: true, email: true } }
            } as any;
            const svRecord = await this.prisma.servicioVehiculo.findFirst({ where: { servicio_id }, include: svInclude2 } as any);
            return mapServicioVehiculoToServicioDetalle(svRecord as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async guardarFirmaEntrada(servicio_id: string, firma_url: string, negocio_id: string) {
        try {
            const sv = await this.prisma.servicioVehiculo.findFirst({ where: { servicio_id } });
            const servicio = await this.prisma.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');
            const estado = sv?.estado ?? (servicio as any).estado;
            if (estado !== 'RECEPCION') throw new Error('El servicio no está en estado RECEPCION');

            await this.prisma.servicio.update({ where: { id: servicio_id }, data: { firma_entrada: firma_url } });

            // update estado only in servicioVehiculo
            await this.prisma.servicioVehiculo.updateMany({ where: { servicio_id }, data: { estado: 'EN_SERVICIO' } as any });

            const svInclude3 = {
                servicio: { include: { imagenes: true, checklist: { include: { checklist_item: { select: { id: true, nombre: true } } } }, tareas: true, cliente: { select: { id: true, nombre: true, telefono: true, email: true, dpi: true } }, tipo_servicio: true } },
                vehiculo: { include: { modelo: true } },
                mecanico: { select: { id: true, nombre: true, apellido: true, email: true } }
            } as any;
            const svAfter = await this.prisma.servicioVehiculo.findFirst({ where: { servicio_id }, include: svInclude3 } as any);
            return mapServicioVehiculoToServicioDetalle(svAfter as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtenerImagen(id: string) {
        try {
            const record = await this.prisma.imagen.findUnique({ where: { id } });
            if (!record) return null;
            return { id: record.id, servicio_id: record.servicio_id, url: record.imagen, created_at: record.created_at, updated_at: record.updated_at };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminarImagen(id: string, negocio_id: string) {
        try {
            const imagen = await this.prisma.imagen.findUnique({ where: { id } });
            if (!imagen) throw new Error('Imagen no encontrada');

            const servicio = await this.prisma.servicio.findFirst({ where: { id: imagen.servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');
            const sv = await this.prisma.servicioVehiculo.findFirst({ where: { servicio_id: imagen.servicio_id } });
            const estado = sv?.estado ?? (servicio as any).estado;
            if (estado !== 'RECEPCION') throw new Error('No se pueden eliminar imágenes en estados diferentes a RECEPCION');

            await this.prisma.imagen.delete({ where: { id } });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizarTarea(id: string, servicio_id: string, negocio_id: string, data: { nombre?: string; completado?: boolean; observacion?: string | null }) {
        try {
            const tarea = await this.prisma.servicioTarea.findUnique({ where: { id } });
            if (!tarea || tarea.servicio_id !== servicio_id) throw new Error('Tarea no encontrada');

            const servicio = await this.prisma.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');
            const sv = await this.prisma.servicioVehiculo.findFirst({ where: { servicio_id } });
            const estado = sv?.estado ?? (servicio as any).estado;
            if (!(['EN_SERVICIO', 'ESPERA_REPUESTOS'] as string[]).includes(estado)) throw new Error('No se pueden editar tareas en este estado');

            await this.prisma.servicioTarea.update({ where: { id }, data: { nombre: data.nombre ?? undefined, completado: data.completado ?? undefined, observacion: data.observacion ?? undefined } as any });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async listarChecklistRespuestas(servicio_id: string, negocio_id: string) {
        try {
            const servicio = await this.prisma.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');

            const respuestas = await this.prisma.checklistRespuesta.findMany({ where: { servicio_id }, include: { checklist_item: { select: { id: true, nombre: true } } } });
            return respuestas.map((record: any) => ({ id: record.id, checklist_item_id: record.checklist_item_id, servicio_id: record.servicio_id, estado: record.estado, observaciones: record.observaciones, item: record.checklist_item ? { id: record.checklist_item.id, nombre: record.checklist_item.nombre } : null, created_at: record.created_at, updated_at: record.updated_at }));
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async registrarChecklistRespuesta(data: Omit<ChecklistRespuestaSimple, 'id' | 'created_at' | 'updated_at'>, negocio_id: string) {
        try {
            const servicio = await this.prisma.servicio.findFirst({ where: { id: data.servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');
            const sv = await this.prisma.servicioVehiculo.findFirst({ where: { servicio_id: data.servicio_id } });
            const estado = sv?.estado ?? (servicio as any).estado;
            if (estado !== 'RECEPCION') throw new Error('No se pueden registrar respuestas de checklist en estados diferentes a RECEPCION');

            const created = await this.prisma.checklistRespuesta.create({ data: { checklist_item_id: data.checklist_item_id, servicio_id: data.servicio_id, estado: data.estado as any, observaciones: data.observaciones ?? null }, include: { checklist_item: { select: { id: true, nombre: true } } } });
            return { id: created.id, checklist_item_id: created.checklist_item_id, servicio_id: created.servicio_id, estado: created.estado, observaciones: created.observaciones, item: created.checklist_item ? { id: created.checklist_item.id, nombre: created.checklist_item.nombre } : null, created_at: created.created_at, updated_at: created.updated_at };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizarChecklistRespuesta(id: string, servicio_id: string, negocio_id: string, data: Partial<Omit<ChecklistRespuestaSimple, 'id' | 'servicio_id' | 'created_at' | 'updated_at'>>) {
        try {
            const respuesta = await this.prisma.checklistRespuesta.findUnique({ where: { id } });
            if (!respuesta || respuesta.servicio_id !== servicio_id) throw new Error('Checklist respuesta no encontrada');

            const servicio = await this.prisma.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');
            const sv = await this.prisma.servicioVehiculo.findFirst({ where: { servicio_id } });
            const estado = sv?.estado ?? (servicio as any).estado;
            if (estado !== 'RECEPCION') throw new Error('No se puede editar el checklist en estados diferentes a RECEPCION');

            const updated = await this.prisma.checklistRespuesta.update({ where: { id }, data: { checklist_item_id: data.checklist_item_id ?? undefined, estado: data.estado ? data.estado as any : undefined, observaciones: data.observaciones ?? undefined } as any, include: { checklist_item: { select: { id: true, nombre: true } } } });
            return { id: updated.id, checklist_item_id: updated.checklist_item_id, servicio_id: updated.servicio_id, estado: updated.estado, observaciones: updated.observaciones, item: updated.checklist_item ? { id: updated.checklist_item.id, nombre: updated.checklist_item.nombre } : null, created_at: updated.created_at, updated_at: updated.updated_at };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminarChecklistRespuesta(id: string, servicio_id: string, negocio_id: string) {
        try {
            const respuesta = await this.prisma.checklistRespuesta.findUnique({ where: { id } });
            if (!respuesta || respuesta.servicio_id !== servicio_id) throw new Error('Checklist respuesta no encontrada');

            const servicio = await this.prisma.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');
            const sv = await this.prisma.servicioVehiculo.findFirst({ where: { servicio_id } });
            const estado = sv?.estado ?? (servicio as any).estado;
            if (estado !== 'RECEPCION') throw new Error('No se puede eliminar elementos del checklist en estados diferentes a RECEPCION');

            await this.prisma.checklistRespuesta.delete({ where: { id } });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async asociarCliente(servicio_id: string, negocio_id: string) {
        try {
            const servicio = await this.prisma.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');

            const sv = await this.prisma.servicioVehiculo.findFirst({ where: { servicio_id } });
            if (!sv) throw new Error('ServicioVehiculo no encontrado');

            const vehiculo = await this.prisma.vehiculo.findFirst({ where: { id: sv.vehiculo_id, negocio_id, activo: true } });
            if (!vehiculo) throw new Error('Vehículo no encontrado');
            if (!vehiculo.cliente_id) throw new Error('El vehículo no tiene un cliente asociado');

            await this.prisma.servicio.update({ where: { id: servicio_id }, data: { cliente_id: vehiculo.cliente_id } });
            const svUpdated = await this.prisma.servicioVehiculo.findFirst({ where: { servicio_id }, include: { servicio: { include: { imagenes: true, checklist: { include: { checklist_item: { select: { id: true, nombre: true } } } }, tareas: true, cliente: true, tipo_servicio: true } }, vehiculo: { include: { modelo: true } }, mecanico: { select: { id: true, nombre: true, apellido: true, email: true } } } });
            return mapServicioVehiculoToServicioDetalle(svUpdated as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizarClienteExterno(servicio_id: string, negocio_id: string, data: { nombre_extra: string; documento_extra: string; numero_extra: string }) {
        try {
            const servicio = await this.prisma.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');
            const sv = await this.prisma.servicioVehiculo.findFirst({ where: { servicio_id } });
            const estado = sv?.estado ?? (servicio as any).estado;
            if (estado !== 'RECEPCION') throw new Error('El servicio no está en estado RECEPCION');

            await this.prisma.servicio.update({ where: { id: servicio_id }, data: { nombre_extra: data.nombre_extra, documento_extra: data.documento_extra, numero_extra: data.numero_extra } });
            const svRecord = await this.prisma.servicioVehiculo.findFirst({ where: { servicio_id }, include: { servicio: { include: { imagenes: true, checklist: { include: { checklist_item: { select: { id: true, nombre: true } } } }, tareas: true, cliente: true } }, vehiculo: { include: { modelo: true } }, mecanico: { select: { id: true, nombre: true, apellido: true, email: true } } } });
            return mapServicioVehiculoToServicioDetalle(svRecord as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async asociarMecanico(servicio_id: string, mecanico_id: string, negocio_id: string) {
        try {
            const servicio = await this.prisma.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');

            await this.prisma.servicioVehiculo.updateMany({ where: { servicio_id }, data: { mecanico_id } as any });
            const svRecord = await this.prisma.servicioVehiculo.findFirst({ where: { servicio_id }, include: { servicio: { include: { imagenes: true, checklist: { include: { checklist_item: { select: { id: true, nombre: true } } } }, tareas: true, cliente: true, tipo_servicio: true } }, vehiculo: { include: { modelo: true } }, mecanico: { select: { id: true, nombre: true, apellido: true, email: true } } } });
            return mapServicioVehiculoToServicioDetalle(svRecord as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async registrarRepuestoCliente(data: any, servicio_id: string, negocio_id: string) {
        try {
            const servicio = await this.prisma.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');
            const sv = await this.prisma.servicioVehiculo.findFirst({ where: { servicio_id } });
            const estado = sv?.estado ?? (servicio as any).estado;
            if (estado !== 'RECEPCION') throw new Error('No se pueden crear repuestos en este estado');

            const created = await this.prisma.servicioRepuestoCliente.create({ data: { servicio_id, repuesto: data.repuesto, cantidad: data.cantidad } });
            return created as any;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async crearRepuesto(servicio_id: string, detalle: any, negocio_id: string, sucursal_id: string) {
        try {
            const servicio = await this.prisma.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');

            const created = await this.prisma.servicioRepuesto.create({ data: { servicio_id, variante_id: detalle.variante_id ?? undefined, lote_id: detalle.lote_id ?? undefined, cantidad: detalle.cantidad, precio_venta: detalle.precio_venta, costo: detalle.costo_unitario ?? undefined }, include: { lote: { include: { variante: { include: { producto: true } } } } } });
            return created;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async crearRepuestosAtomicos(servicio_id: string, detalles: any[], negocio_id: string, sucursal_id: string) {
        try {
            return await this.prisma.$transaction(async (tx) => {
                const servicio = await tx.servicio.findFirst({ where: { id: servicio_id, negocio_id, sucursal_id, activo: true } });
                if (!servicio) throw new Error('Servicio no encontrado');

                const created: any[] = [];

                for (const d of detalles) {
                    if (!d.lote_id) throw new Error('LOTE_REQUERIDO');
                    const loteRecord = await tx.lote.findFirst({ where: { id: d.lote_id, negocio_id } });
                    if (!loteRecord) throw new Error('LOTE_NO_ENCONTRADO');
                    const actual = loteRecord.cantidad_actual ?? 0;
                    if (actual < d.cantidad) throw new Error('INSUFICIENTE_STOCK');

                    const c = await tx.servicioRepuesto.create({ data: { servicio_id, variante_id: d.variante_id ?? undefined, lote_id: d.lote_id, cantidad: d.cantidad, precio_venta: d.precio_venta, costo: d.costo_unitario }, include: { variante: { include: { producto: true, valores: { include: { atributo: true } } } } } });
                    created.push(c);
                }

                return created;
            }, { timeout: 20000 });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminarRepuestoCliente(id: string, servicio_id: string, negocio_id: string) {
        try {
            const servicio = await this.prisma.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');
            const sv = await this.prisma.servicioVehiculo.findFirst({ where: { servicio_id } });
            const estado = sv?.estado ?? (servicio as any).estado;
            if (estado !== 'RECEPCION') throw new Error('No se pueden eliminar repuestos en este estado');

            const rep = await this.prisma.servicioRepuestoCliente.findUnique({ where: { id } });
            if (!rep || rep.servicio_id !== servicio_id) throw new Error('Repuesto no encontrado');

            await this.prisma.servicioRepuestoCliente.delete({ where: { id } });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminarRepuesto(id: string, servicio_id: string, negocio_id: string, sucursal_id: string) {
        try {
            const servicio = await this.prisma.servicio.findFirst({ where: { id: servicio_id, negocio_id, sucursal_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');

            const rep = await this.prisma.servicioRepuesto.findFirst({ where: { id, servicio_id } });
            if (!rep) throw new Error('Repuesto no encontrado');

            await this.prisma.servicioRepuesto.delete({ where: { id } });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminarTareasNoExtra(servicio_id: string, negocio_id: string) {
        try {
            const servicio = await this.prisma.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');

            await this.prisma.servicioTarea.deleteMany({ where: { servicio_id, extra: false } });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async crearTareasDesdeTipoServicio(servicio_id: string, tipo_servicio_id: string | null, negocio_id: string) {
        try {
            if (!tipo_servicio_id) return;

            const tipoServicio = await this.prisma.tipoServicio.findFirst({ where: { id: tipo_servicio_id, negocio_id, activo: true }, include: { opciones: { include: { opcion_servicio: true } } } });
            if (!tipoServicio) throw new Error('Tipo de servicio no encontrado');

            const tareasData = (tipoServicio.opciones ?? []).map((op) => ({ servicio_id, nombre: op.opcion_servicio.nombre, completado: false, observacion: null, extra: false }));
            if (tareasData.length === 0) return;

            await this.prisma.servicioTarea.createMany({ data: tareasData });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async listarCambiosSiguienteServicio(servicio_id: string, negocio_id: string) {
        try {
            const servicio = await this.prisma.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');

            const cambios = await this.prisma.cambiosSiguienteServicio.findMany({
                where: { servicio_id },
                orderBy: { created_at: 'desc' }
            });

            return cambios as any;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async crearCambioSiguienteServicio(servicio_id: string, data: { item: string }, negocio_id: string) {
        try {
            const servicio = await this.prisma.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');

            const cambio = await this.prisma.cambiosSiguienteServicio.create({
                data: { servicio_id, item: data.item }
            });

            return cambio as any;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminarCambioSiguienteServicio(id: string, servicio_id: string, negocio_id: string) {
        try {
            const servicio = await this.prisma.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');

            const deleted = await this.prisma.cambiosSiguienteServicio.deleteMany({ where: { id, servicio_id } });
            if (deleted.count === 0) throw new Error('Cambio no encontrado');
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizarObservaciones(id: string, negocio_id: string, observaciones: string | null) {
        try {
            await this.prisma.servicio.update({ where: { id, negocio_id, activo: true }, data: { observaciones } });
            const sv = await this.prisma.servicioVehiculo.findFirst({ where: { servicio_id: id }, include: { servicio: { include: { imagenes: true, checklist: { include: { checklist_item: { select: { id: true, nombre: true } } } }, tareas: true, cliente: true, tipo_servicio: true } }, vehiculo: { include: { modelo: true } }, mecanico: { select: { id: true, nombre: true, apellido: true, email: true } } } });
            return mapServicioVehiculoToServicioDetalle(sv as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async cambiarMecanico(servicio_id: string, mecanicoAnteriorId: string, mecanicoNuevoId: string, negocio_id: string) {
        try {
            const servicio = await this.prisma.servicio.findFirst({ where: { id: servicio_id, negocio_id, activo: true } });
            if (!servicio) throw new Error('Servicio no encontrado');

            await this.prisma.servicioVehiculo.updateMany({ where: { servicio_id }, data: { mecanico_id: mecanicoNuevoId } as any });
            const sv = await this.prisma.servicioVehiculo.findFirst({ where: { servicio_id }, include: { servicio: { include: { imagenes: true, checklist: { include: { checklist_item: { select: { id: true, nombre: true } } } }, tareas: true, cliente: true, tipo_servicio: true } }, vehiculo: { include: { modelo: true } }, mecanico: { select: { id: true, nombre: true, apellido: true, email: true } } } });
            return mapServicioVehiculoToServicioDetalle(sv as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
