import type { PrismaClient } from "@prisma/client";
import type { VentaRepository } from "../domain/venta.repository.js";
import type { VentaSimple, VentaObtenerDetalle, VentaCrear, VentaActualizar, MetodoPago } from "../domain/venta.entity.js";
import type { Pagination } from "../../../shared/domain/pagination.js";
import type { Paginated } from "../../../shared/domain/paginated.js";
import { PrismaErrorMapper } from "../../../shared/database/prisma/PrismaErrorMapper.js";
import { VentaMapper } from "./mappers/venta.mapper.js";
import { LoteNotFoundPersistenceError } from '../../../shared/database/errors/LoteNotFoundPersistenceError.js';
import { InsufficientStockPersistenceError } from '../../../shared/database/errors/InsufficientStockPersistenceError.js';
import { VentaNotFoundPersistenceError } from '../../../shared/database/errors/VentaNotFoundPersistenceError.js';
import { NotFoundPersistenceError } from '../../../shared/database/errors/NotFoundPersistenceError.js';
import { PersistenceError } from '../../../shared/database/errors/PersistenceError.js';

export class PrismaVentaRepository implements VentaRepository {
    constructor(private readonly db: PrismaClient) { }

    async registrar(data: VentaCrear, negocio_id: string, sucursal_id: string, usuario_id: string): Promise<VentaObtenerDetalle> {
        try {
            // Ahora el repo solo persiste la venta y los detalles ya resueltos por el Use Case.
            return await this.db.$transaction(async (tx) => {
                // Create venta first without nested detalles. We'll insert detalles explicitly
                const venta = await tx.venta.create({
                    data: {
                        negocio_id,
                        sucursal_id,
                        usuario_id,
                        cliente_id: data.cliente_id ?? null,
                        estado: data.estado,
                        metodo_pago: data.metodo_pago,
                        total: data.total ?? 0,
                        total_costo: data.total_costo ?? 0
                    }
                });

                // If detalles were provided, validate availability and create them one by one.
                // We DO NOT perform manual lote updates here because a DB trigger (`descontar_stock_lote`) handles decrement on insert.
                if (data.detalles && data.detalles.length > 0) {
                    for (const d of data.detalles) {
                        if (!d.lote_id) {
                            await tx.ventaDetalle.create({ data: { venta_id: venta.id, variante_id: d.variante_id ?? undefined, descripcion: d.descripcion, cantidad: d.cantidad, precio_unitario: d.precio_unitario, costo_unitario: d.costo_unitario } });
                            continue;
                        }

                        const loteRecord = await tx.lote.findFirst({ where: { id: d.lote_id, negocio_id } });
                        if (!loteRecord) throw new LoteNotFoundPersistenceError();
                        const actual = loteRecord.cantidad_actual ?? 0;
                        if (actual < d.cantidad) throw new InsufficientStockPersistenceError();

                        // Create ventaDetalle — the DB trigger will decrement lote.cantidad_actual atomically with the insert
                        await tx.ventaDetalle.create({ data: { venta_id: venta.id, variante_id: d.variante_id ?? undefined, lote_id: d.lote_id, descripcion: d.descripcion, cantidad: d.cantidad, precio_unitario: d.precio_unitario, costo_unitario: d.costo_unitario } });
                    }

                    const ventaWithDetails = await tx.venta.findUnique({
                        where: { id: venta.id },
                        include: {
                            usuario: true,
                            cliente: true,
                            servicio: { include: { vehiculo: { include: { modelo: true } } } },
                            detalles: { include: { lote: { include: { variante: { include: { producto: true } } } } } }
                        }
                    });
                    return VentaMapper.mapDetalle(ventaWithDetails as any);
                }

                return VentaMapper.mapDetalle(venta);
            }, { maxWait: 5000, timeout: 20000 });
        } catch (error: any) {
            if (error instanceof Error && (error.message.includes("INSUFICIENTE_STOCK") || error.message.includes("PRODUCTO_NO_ENCONTRADO") || error.message.includes("VARIANTE_NO_ENCONTRADA"))) {
                throw error;
            }
            throw PrismaErrorMapper.map(error);
        }
    }

    async crearDetalle(ventaId: string, detalle: any, negocio_id: string, sucursal_id: string): Promise<any> {
        try {
            const venta = await this.db.venta.findFirst({ where: { id: ventaId, negocio_id, sucursal_id, activo: true } });
            if (!venta) throw new VentaNotFoundPersistenceError();

            const created = await this.db.ventaDetalle.create({
                data: {
                    venta_id: ventaId,
                    variante_id: detalle.variante_id ?? undefined,
                    lote_id: detalle.lote_id ?? null,
                    descripcion: detalle.descripcion,
                    cantidad: detalle.cantidad,
                    precio_unitario: detalle.precio_unitario,
                    costo_unitario: detalle.costo_unitario
                },
                include: { lote: { include: { variante: { include: { producto: true } } } } }
            });

            // Recalcular totales de venta
            const agregados = await this.db.ventaDetalle.aggregate({
                where: { venta_id: ventaId },
                _sum: { precio_unitario: true, cantidad: true }
            });

            // Compute total using details
            const detalles = await this.db.ventaDetalle.findMany({ where: { venta_id: ventaId } });
            const total = detalles.reduce((s: number, d: any) => s + (d.precio_unitario * d.cantidad), 0);

            await this.db.venta.update({ where: { id: ventaId }, data: { total } });

            return created;
        } catch (error: any) {
            if (error instanceof PersistenceError) throw error;
            throw PrismaErrorMapper.map(error);
        }
    }

    async crearDetallesAtomicos(ventaId: string, detalles: any[], negocio_id: string, sucursal_id: string): Promise<any[]> {
        try {
            return await this.db.$transaction(async (tx) => {
                const venta = await tx.venta.findFirst({ where: { id: ventaId, negocio_id, sucursal_id, activo: true } });
                if (!venta) throw new VentaNotFoundPersistenceError();

                const created: any[] = [];

                for (const d of detalles) {
                    if (!d.lote_id) {
                        // create detalle without lote
                        const c = await tx.ventaDetalle.create({ data: { venta_id: ventaId, variante_id: d.variante_id ?? undefined, descripcion: d.descripcion, cantidad: d.cantidad, precio_unitario: d.precio_unitario, costo_unitario: d.costo_unitario }, include: { lote: { include: { variante: { include: { producto: true } } } } } });
                        created.push(c);
                        continue;
                    }

                    const loteRecord = await tx.lote.findFirst({ where: { id: d.lote_id, negocio_id } });
                    if (!loteRecord) throw new LoteNotFoundPersistenceError();
                    const actual = loteRecord.cantidad_actual ?? 0;
                    if (actual < d.cantidad) throw new InsufficientStockPersistenceError();

                    // Do not update lote here; DB trigger will decrement stock on insert.
                    const c = await tx.ventaDetalle.create({ data: { venta_id: ventaId, variante_id: d.variante_id ?? undefined, lote_id: d.lote_id, descripcion: d.descripcion, cantidad: d.cantidad, precio_unitario: d.precio_unitario, costo_unitario: d.costo_unitario }, include: { lote: { include: { variante: { include: { producto: true } } } } } });
                    created.push(c);
                }

                const detallesVenta = await tx.ventaDetalle.findMany({ where: { venta_id: ventaId } });
                const total = detallesVenta.reduce((s: number, d: any) => s + (d.precio_unitario * d.cantidad), 0);
                await tx.venta.update({ where: { id: ventaId }, data: { total } });

                return created;
            });
        } catch (error: any) {
            if (error instanceof PersistenceError) throw error;
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminarDetalle(ventaId: string, detalleId: string, negocio_id: string, sucursal_id: string): Promise<void> {
        try {
            const detalle = await this.db.ventaDetalle.findFirst({ where: { id: detalleId, venta_id: ventaId } });
            if (!detalle) throw new NotFoundPersistenceError();

            await this.db.ventaDetalle.delete({ where: { id: detalleId } });

            // Recalcular totales de venta
            const detalles = await this.db.ventaDetalle.findMany({ where: { venta_id: ventaId } });
            const total = detalles.reduce((s: number, d: any) => s + (d.precio_unitario * d.cantidad), 0);
            await this.db.venta.update({ where: { id: ventaId }, data: { total } });
        } catch (error: any) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async finalizarVenta(ventaId: string, negocio_id: string, sucursal_id: string, metodo_pago?: MetodoPago): Promise<VentaSimple> {
        try {
            return await this.db.$transaction(async (tx) => {
                const ventaActual = await tx.venta.findFirst({ where: { id: ventaId, negocio_id, sucursal_id, activo: true } });
                if (!ventaActual) throw new VentaNotFoundPersistenceError();
                if (ventaActual.estado !== 'PENDIENTE') throw new Error('VENTA_NO_PENDIENTE');

                const ventaUpdated = await tx.venta.update({
                    where: { id: ventaId },
                    data: { estado: 'COMPLETADA', metodo_pago: metodo_pago ?? ventaActual.metodo_pago },
                    include: { usuario: true, cliente: true, servicio: { include: { vehiculo: { include: { modelo: true } } } }, detalles: { include: { lote: { include: { variante: { include: { producto: true } } } } } } }
                });

                return VentaMapper.mapSimple(ventaUpdated);
            });
        } catch (error: any) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizar(id: string, data: VentaActualizar, negocio_id: string, sucursal_id: string): Promise<VentaSimple> {
        try {
            return await this.db.$transaction(async (tx) => {
                const ventaActual = await tx.venta.findFirst({
                    where: { id, negocio_id, sucursal_id, activo: true }
                });

                if (!ventaActual) throw new VentaNotFoundPersistenceError();
                if (ventaActual.estado === 'COMPLETADA' || ventaActual.estado === 'ANULADA') {
                    throw new Error("VENTA_NO_EDITABLE");
                }

                const ventaUpdated = await tx.venta.update({
                    where: { id },
                    data: {
                        cliente_id: data.cliente_id ?? ventaActual.cliente_id,
                        metodo_pago: data.metodo_pago ?? ventaActual.metodo_pago,
                        estado: data.estado ?? ventaActual.estado
                    },
                    include: { usuario: true, cliente: true, servicio: { include: { vehiculo: { include: { modelo: true } } } }, detalles: { include: { lote: { include: { variante: { include: { producto: true } } } } } } }
                });

                return VentaMapper.mapSimple(ventaUpdated);
            }, { maxWait: 5000, timeout: 20000 });
        } catch (error: any) {
            if (error instanceof PersistenceError) throw error;
            throw PrismaErrorMapper.map(error);
        }
    }

    async anular(id: string, negocio_id: string, sucursal_id: string, comentario: string): Promise<VentaSimple> {
        try {
            return await this.db.$transaction(async (tx) => {
                const ventaActual = await tx.venta.findFirst({
                    where: { id, negocio_id, sucursal_id, activo: true }
                });

                if (!ventaActual) throw new VentaNotFoundPersistenceError();
                if (ventaActual.estado === 'ANULADA') throw new Error("VENTA_YA_ANULADA");

                const ventaUpdated = await tx.venta.update({
                    where: { id, negocio_id, sucursal_id },
                    data: { estado: 'ANULADA', comentarios: comentario },
                    include: { usuario: true, cliente: true, servicio: { include: { vehiculo: { include: { modelo: true } } } }, detalles: { include: { lote: { include: { variante: { include: { producto: true } } } } } } }
                });

                return VentaMapper.mapSimple(ventaUpdated);
            }, { maxWait: 5000, timeout: 20000 });
        } catch (error: any) {
            if (error instanceof PersistenceError) throw error;
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtener(id: string, negocio_id: string, sucursal_id: string): Promise<VentaObtenerDetalle | null> {
        const venta = await this.db.venta.findFirst({
            where: { id, negocio_id, sucursal_id, activo: true },
            include: { usuario: true, cliente: true, servicio: { include: { vehiculo: { include: { modelo: true } } } }, detalles: { include: { lote: { include: { variante: { include: { producto: true } } } } } } }
        });
        if (!venta) return null;
        return VentaMapper.mapDetalle(venta);
    }

    async listar(negocio_id: string, sucursal_id: string, pagination: Pagination, cliente_id?: string | null): Promise<Paginated<VentaSimple>> {
        const { page, perPage } = pagination;
        const offset = (page - 1) * perPage;

        const where = {
            negocio_id,
            sucursal_id,
            activo: true,
            ...(cliente_id ? { cliente_id } : {})
        };

        const [total, ventas] = await Promise.all([
            this.db.venta.count({ where }),
            this.db.venta.findMany({
                where,
                include: { usuario: true, cliente: true, servicio: { include: { vehiculo: { include: { modelo: true } } } }, detalles: { include: { lote: { include: { variante: { include: { producto: true } } } } } } },
                take: perPage,
                skip: offset,
                orderBy: { created_at: 'desc' }
            })
        ]);

        return {
            data: ventas.map(v => VentaMapper.mapSimple(v)),
            total,
            page,
            perPage
        };
    }
}
