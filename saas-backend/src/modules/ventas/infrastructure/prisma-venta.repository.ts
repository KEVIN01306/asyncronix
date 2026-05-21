import type { PrismaClient } from "@prisma/client";
import type { VentaRepository } from "../domain/venta.repository.js";
import type { VentaSimple, VentaObtenerDetalle, VentaCrear, VentaActualizar, MetodoPago } from "../domain/venta.entity.js";
import type { Pagination } from "../../../shared/domain/pagination.js";
import type { Paginated } from "../../../shared/domain/paginated.js";
import { PrismaErrorMapper } from "../../../shared/database/prisma/PrismaErrorMapper.js";
import { VentaMapper } from "./mappers/venta.mapper.js";

export class PrismaVentaRepository implements VentaRepository {
    constructor(private readonly db: PrismaClient) { }

    async registrar(data: VentaCrear, negocio_id: string, sucursal_id: string, usuario_id: string): Promise<VentaObtenerDetalle> {
        try {
            // Ahora el repo solo persiste la venta y los detalles ya resueltos por el Use Case.
            return await this.db.$transaction(async (tx) => {
                const venta = await tx.venta.create({
                    data: {
                        negocio_id,
                        sucursal_id,
                        usuario_id,
                        cliente_id: data.cliente_id ?? null,
                        estado: data.estado,
                        metodo_pago: data.metodo_pago,
                        total: data.total ?? 0,
                        total_costo: data.total_costo ?? 0,
                        ...(data.detalles ? { detalles: { create: data.detalles } } : {})
                    },
                    include: { usuario: true, cliente: true, detalles: { include: { lote: { include: { producto: true } } } } }
                });

                return VentaMapper.mapDetalle(venta);
            }, { maxWait: 5000, timeout: 20000 });
        } catch (error: any) {
            if (error instanceof Error && (error.message.includes("INSUFICIENTE_STOCK") || error.message.includes("PRODUCTO_NO_ENCONTRADO"))) {
                throw error;
            }
            throw PrismaErrorMapper.map(error);
        }
    }

    async crearDetalle(ventaId: string, detalle: any, negocio_id: string, sucursal_id: string): Promise<any> {
        try {
            const venta = await this.db.venta.findFirst({ where: { id: ventaId, negocio_id, sucursal_id, activo: true } });
            if (!venta) throw new Error('VENTA_NO_ENCONTRADA');

            const created = await this.db.ventaDetalle.create({
                data: {
                    venta_id: ventaId,
                    lote_id: detalle.lote_id ?? null,
                    descripcion: detalle.descripcion,
                    cantidad: detalle.cantidad,
                    precio_unitario: detalle.precio_unitario,
                    costo_unitario: detalle.costo_unitario
                },
                include: { lote: { include: { producto: true } } }
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
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminarDetalle(ventaId: string, detalleId: string, negocio_id: string, sucursal_id: string): Promise<void> {
        try {
            const detalle = await this.db.ventaDetalle.findFirst({ where: { id: detalleId, venta_id: ventaId } });
            if (!detalle) throw new Error('DETALLE_NO_ENCONTRADO');

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
                if (!ventaActual) throw new Error('VENTA_NO_ENCONTRADA');
                if (ventaActual.estado !== 'PENDIENTE') throw new Error('VENTA_NO_PENDIENTE');

                const ventaUpdated = await tx.venta.update({
                    where: { id: ventaId },
                    data: { estado: 'COMPLETADA', metodo_pago: metodo_pago ?? ventaActual.metodo_pago },
                    include: { usuario: true, cliente: true, detalles: { include: { lote: { include: { producto: true } } } } }
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

                if (!ventaActual) throw new Error("VENTA_NO_ENCONTRADA");
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
                    include: { usuario: true, cliente: true, detalles: { include: { lote: { include: { producto: true } } } } }
                });

                return VentaMapper.mapSimple(ventaUpdated);
            }, { maxWait: 5000, timeout: 20000 });
        } catch (error: any) {
            if (error instanceof Error && error.message.includes("VENTA_")) {
                throw error;
            }
            throw PrismaErrorMapper.map(error);
        }
    }

    async anular(id: string, negocio_id: string, sucursal_id: string, comentario: string): Promise<VentaSimple> {
        try {
            return await this.db.$transaction(async (tx) => {
                const ventaActual = await tx.venta.findFirst({
                    where: { id, negocio_id, sucursal_id, activo: true }
                });

                if (!ventaActual) throw new Error("VENTA_NO_ENCONTRADA");
                if (ventaActual.estado === 'ANULADA') throw new Error("VENTA_YA_ANULADA");

                const ventaUpdated = await tx.venta.update({
                    where: { id, negocio_id, sucursal_id },
                    data: { estado: 'ANULADA', comentarios: comentario },
                    include: { usuario: true, cliente: true, detalles: { include: { lote: { include: { producto: true } } } } }
                });

                return VentaMapper.mapSimple(ventaUpdated);
            }, { maxWait: 5000, timeout: 20000 });
        } catch (error: any) {
            if (error instanceof Error && error.message.includes("VENTA_")) {
                throw error;
            }
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtener(id: string, negocio_id: string, sucursal_id: string): Promise<VentaObtenerDetalle | null> {
        const venta = await this.db.venta.findFirst({
            where: { id, negocio_id, sucursal_id, activo: true },
            include: { usuario: true, cliente: true, detalles: { include: { lote: { include: { producto: true } } } } }
        });
        if (!venta) return null;
        return VentaMapper.mapDetalle(venta);
    }

    async listar(negocio_id: string, sucursal_id: string, pagination: Pagination): Promise<Paginated<VentaSimple>> {
        const { page, perPage } = pagination;
        const offset = (page - 1) * perPage;

        const where = { negocio_id, sucursal_id, activo: true };

        const [total, ventas] = await Promise.all([
            this.db.venta.count({ where }),
            this.db.venta.findMany({
                where,
                include: { usuario: true, cliente: true, detalles: { include: { lote: { include: { producto: true } } } } },
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
