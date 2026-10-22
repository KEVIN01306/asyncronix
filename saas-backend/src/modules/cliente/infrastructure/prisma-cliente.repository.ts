import { Prisma, type PrismaClient } from "@prisma/client";
import { PrismaErrorMapper } from "../../../shared/database/prisma/PrismaErrorMapper.js";
import type { Paginated } from "../../../shared/domain/paginated.js";
import type { ClienteActualizar, ClienteCrear, ClienteObtenidoDetalle, ClienteSimple, ConteoRelacionesCliente } from "../domain/cliente.entity.js";
import type { ClienteRepository } from "../domain/cliente.repository.js";
import { ClienteMapper } from "./mappers/cliente.mapper.js";
import { NotFoundPersistenceError } from "../../../shared/database/errors/NotFoundPersistenceError.js";

export class PrismaClienteRepository implements ClienteRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async registrar(data: ClienteCrear, passwordHash: string | null, negocioId: string): Promise<ClienteObtenidoDetalle> {
        try {
            const cliente = await this.prisma.cliente.create({
                data: {
                    nombre: data.nombre,
                    apellido: data.apellido ?? null,
                    telefono: data.telefono ?? null,
                    email: data.email ?? null,
                    nit: data.nit ?? null,
                    dpi: data.dpi ?? null,
                    password_hash: passwordHash,
                    negocios: {
                        connect: { id: negocioId }
                    }
                },
                include: { negocios: true }
            });

            return ClienteMapper.mapDetalle(cliente);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizar(id: string, data: ClienteActualizar): Promise<ClienteObtenidoDetalle> {
        try {
            const cliente = await this.prisma.cliente.update({
                where: { id },
                data: {
                    ...(data.nombre !== undefined && { nombre: data.nombre }),
                    ...(data.apellido !== undefined && { apellido: data.apellido }),
                    ...(data.telefono !== undefined && { telefono: data.telefono }),
                    ...(data.email !== undefined && { email: data.email }),
                    ...(data.nit !== undefined && { nit: data.nit }),
                    ...(data.dpi !== undefined && { dpi: data.dpi }),
                    ...(data.password_hash !== undefined && { password_hash: data.password_hash }),
                },
                include: { negocios: true }
            });

            return ClienteMapper.mapDetalle(cliente);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async asociarNegocio(clienteId: string, negocioId: string): Promise<void> {
        try {
            await this.prisma.cliente.update({
                where: { id: clienteId },
                data: {
                    negocios: {
                        connect: { id: negocioId }
                    }
                }
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async estaAsociadoANegocio(clienteId: string, negocioId: string): Promise<boolean> {
        try {
            const cliente = await this.prisma.cliente.findFirst({
                where: {
                    id: clienteId,
                    negocios: {
                        some: { id: negocioId }
                    }
                },
                select: { id: true }
            });

            return Boolean(cliente);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminar(id: string): Promise<void> {
        try {
            const existing = await this.prisma.cliente.findUnique({ where: { id } });
            if (!existing) {
                throw new NotFoundPersistenceError();
            }

            await this.prisma.cliente.delete({
                where: { id }
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtenerPorId(id: string): Promise<ClienteObtenidoDetalle | null> {
        try {
            const cliente = await this.prisma.cliente.findUnique({
                where: { id },
                include: { negocios: true }
            });

            if (!cliente) return null;

            const conteo = await this.obtenerConteoRelaciones(id);
            return ClienteMapper.mapDetalle(cliente, conteo);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async buscarPorDpi(dpi: string): Promise<ClienteObtenidoDetalle | null> {
        try {
            const cliente = await this.prisma.cliente.findFirst({
                where: { dpi },
                include: { negocios: true }
            });

            return cliente ? ClienteMapper.mapDetalle(cliente) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async buscarPorNit(nit: string): Promise<ClienteObtenidoDetalle | null> {
        try {
            const cleanNit = nit.trim().toUpperCase();
            if (cleanNit === "CF" || cleanNit === "C/F") return null;

            const cliente = await this.prisma.cliente.findFirst({
                where: { nit: cleanNit },
                include: { negocios: true }
            });

            return cliente ? ClienteMapper.mapDetalle(cliente) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async buscarPorDocumento(data: { nit?: string | null; dpi?: string | null }): Promise<ClienteObtenidoDetalle | null> {
        try {
            const orFilters: Prisma.ClienteWhereInput[] = [];

            if (data.dpi) {
                orFilters.push({ dpi: data.dpi });
            }
            if (data.nit) {
                const cleanNit = data.nit.trim().toUpperCase();
                if (cleanNit !== "CF" && cleanNit !== "C/F") {
                    orFilters.push({ nit: cleanNit });
                }
            }

            if (orFilters.length === 0) return null;

            const cliente = await this.prisma.cliente.findFirst({
                where: { OR: orFilters },
                include: { negocios: true }
            });

            return cliente ? ClienteMapper.mapDetalle(cliente) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async buscarPorDocumentoYNegocio(data: { nit?: string | null; dpi?: string | null }, negocioId: string): Promise<ClienteObtenidoDetalle | null> {
        try {
            const orFilters: Prisma.ClienteWhereInput[] = [];

            if (data.dpi) {
                orFilters.push({ dpi: data.dpi });
            }
            if (data.nit) {
                const cleanNit = data.nit.trim().toUpperCase();
                if (cleanNit !== "CF" && cleanNit !== "C/F") {
                    orFilters.push({ nit: cleanNit });
                }
            }

            if (orFilters.length === 0) return null;

            const cliente = await this.prisma.cliente.findFirst({
                where: {
                    AND: [
                        { negocios: { some: { id: negocioId } } },
                        { OR: orFilters }
                    ]
                },
                include: { negocios: true }
            });

            return cliente ? ClienteMapper.mapDetalle(cliente) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async listar(params: {
        negocio_id: string;
        page: number;
        perPage: number;
        q?: string | null;
        documento?: string | null;
    }): Promise<Paginated<ClienteSimple>> {
        try {
            const { negocio_id, page, perPage, q, documento } = params;
            const skip = (page - 1) * perPage;

            const andFilters: Prisma.ClienteWhereInput[] = [
                { negocios: { some: { id: negocio_id } } }
            ];

            if (q) {
                andFilters.push({
                    OR: [
                        { nombre: { contains: q } },
                        { apellido: { contains: q } },
                        { email: { contains: q } },
                        { telefono: { contains: q } }
                    ]
                });
            }

            if (documento) {
                andFilters.push({
                    OR: [
                        { nit: { contains: documento } },
                        { dpi: { contains: documento } }
                    ]
                });
            }

            const where: Prisma.ClienteWhereInput = { AND: andFilters };

            const [total, clientes] = await Promise.all([
                this.prisma.cliente.count({ where }),
                this.prisma.cliente.findMany({
                    where,
                    include: { negocios: true },
                    skip,
                    take: perPage,
                    orderBy: { created_at: "desc" }
                })
            ]);

            return {
                total,
                data: clientes.map((c) => ClienteMapper.mapSimple(c)),
                page,
                perPage
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async buscarGlobal(params: {
        q?: string | null;
        documento?: string | null;
        limit: number;
    }): Promise<ClienteSimple[]> {
        try {
            const { q, documento, limit } = params;
            const orFilters: Prisma.ClienteWhereInput[] = [];

            if (q) {
                orFilters.push(
                    { nombre: { contains: q } },
                    { apellido: { contains: q } },
                    { email: { contains: q } },
                    { telefono: { contains: q } }
                );
            }

            if (documento) {
                orFilters.push(
                    { nit: { contains: documento } },
                    { dpi: { contains: documento } }
                );
            }

            if (orFilters.length === 0) return [];

            const clientes = await this.prisma.cliente.findMany({
                where: { OR: orFilters },
                include: { negocios: true },
                take: limit,
                orderBy: { created_at: "desc" }
            });

            return clientes.map((c) => ClienteMapper.mapSimple(c));
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtenerConteoRelaciones(id: string): Promise<ConteoRelacionesCliente> {
        try {
            const [
                vehiculos,
                citas,
                servicios,
                ventas,
                pre_ventas,
                cotizaciones,
                facturas,
                sessions
            ] = await Promise.all([
                this.prisma.vehiculo.count({ where: { cliente_id: id } }),
                this.prisma.cita.count({ where: { cliente_id: id } }),
                this.prisma.servicio.count({ where: { cliente_id: id } }),
                this.prisma.venta.count({ where: { cliente_id: id } }),
                this.prisma.preVenta.count({ where: { cliente_id: id } }),
                this.prisma.cotizacion.count({ where: { cliente_id: id } }),
                this.prisma.factura.count({ where: { cliente_id: id } }),
                this.prisma.session.count({ where: { cliente_id: id } })
            ]);

            return {
                vehiculos,
                citas,
                servicios,
                ventas,
                pre_ventas,
                cotizaciones,
                facturas,
                sessions
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async unificar(params: {
        clienteConservarId: string;
        clienteEliminarId: string;
        negocioId: string;
        usuarioId: string;
        datosFusionados: Partial<ClienteActualizar>;
    }): Promise<{ relacionesMigradas: ConteoRelacionesCliente }> {
        const { clienteConservarId, clienteEliminarId, datosFusionados } = params;

        try {
            return await this.prisma.$transaction(async (tx) => {
                // 1. Obtener conteo antes de migrar
                const [
                    vehiculos,
                    citas,
                    servicios,
                    ventas,
                    pre_ventas,
                    cotizaciones,
                    facturas,
                    sessions
                ] = await Promise.all([
                    tx.vehiculo.count({ where: { cliente_id: clienteEliminarId } }),
                    tx.cita.count({ where: { cliente_id: clienteEliminarId } }),
                    tx.servicio.count({ where: { cliente_id: clienteEliminarId } }),
                    tx.venta.count({ where: { cliente_id: clienteEliminarId } }),
                    tx.preVenta.count({ where: { cliente_id: clienteEliminarId } }),
                    tx.cotizacion.count({ where: { cliente_id: clienteEliminarId } }),
                    tx.factura.count({ where: { cliente_id: clienteEliminarId } }),
                    tx.session.count({ where: { cliente_id: clienteEliminarId } })
                ]);

                // 2. Reasignar todas las relaciones al cliente conservado
                if (vehiculos > 0) {
                    await tx.vehiculo.updateMany({
                        where: { cliente_id: clienteEliminarId },
                        data: { cliente_id: clienteConservarId }
                    });
                }

                if (citas > 0) {
                    await tx.cita.updateMany({
                        where: { cliente_id: clienteEliminarId },
                        data: { cliente_id: clienteConservarId }
                    });
                }

                if (servicios > 0) {
                    await tx.servicio.updateMany({
                        where: { cliente_id: clienteEliminarId },
                        data: { cliente_id: clienteConservarId }
                    });
                }

                if (ventas > 0) {
                    await tx.venta.updateMany({
                        where: { cliente_id: clienteEliminarId },
                        data: { cliente_id: clienteConservarId }
                    });
                }

                if (pre_ventas > 0) {
                    await tx.preVenta.updateMany({
                        where: { cliente_id: clienteEliminarId },
                        data: { cliente_id: clienteConservarId }
                    });
                }

                if (cotizaciones > 0) {
                    await tx.cotizacion.updateMany({
                        where: { cliente_id: clienteEliminarId },
                        data: { cliente_id: clienteConservarId }
                    });
                }

                if (facturas > 0) {
                    await tx.factura.updateMany({
                        where: { cliente_id: clienteEliminarId },
                        data: { cliente_id: clienteConservarId }
                    });
                }

                // Las sesiones del cliente eliminado se eliminan/revocan
                if (sessions > 0) {
                    await tx.session.deleteMany({
                        where: { cliente_id: clienteEliminarId }
                    });
                }

                // 3. Fusionar asociaciones de negocios (_ClienteToNegocio)
                const sourceNegocios = await tx.$queryRaw<{ B: string }[]>(
                    Prisma.sql`SELECT B FROM _ClienteToNegocio WHERE A = ${clienteEliminarId}`
                );

                for (const row of sourceNegocios) {
                    await tx.$executeRaw(
                        Prisma.sql`INSERT IGNORE INTO _ClienteToNegocio (A, B) VALUES (${clienteConservarId}, ${row.B})`
                    );
                }

                await tx.$executeRaw(
                    Prisma.sql`DELETE FROM _ClienteToNegocio WHERE A = ${clienteEliminarId}`
                );

                // 4. Liberar DPI del cliente a eliminar para evitar colisiones de clave única (P2002 clientes_dpi_key)
                await tx.cliente.update({
                    where: { id: clienteEliminarId },
                    data: { dpi: null }
                });

                // 5. Eliminar cliente antiguo una vez migradas todas las referencias
                await tx.cliente.delete({
                    where: { id: clienteEliminarId }
                });

                // 6. Actualizar datos fusionados en el cliente conservado
                if (Object.keys(datosFusionados).length > 0) {
                    await tx.cliente.update({
                        where: { id: clienteConservarId },
                        data: datosFusionados
                    });
                }

                return {
                    relacionesMigradas: {
                        vehiculos,
                        citas,
                        servicios,
                        ventas,
                        pre_ventas,
                        cotizaciones,
                        facturas,
                        sessions
                    }
                };
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminarSesiones(clienteId: string): Promise<void> {
        try {
            await this.prisma.session.deleteMany({
                where: { cliente_id: clienteId }
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
