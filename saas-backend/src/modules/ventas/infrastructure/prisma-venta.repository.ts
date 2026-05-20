import type { PrismaClient } from "@prisma/client";
import type { VentaRepository } from "../domain/venta.repository.js";
import type { VentaSimple, VentaObtenerDetalle, VentaCrear, VentaActualizar } from "../domain/venta.entity.js";
import type { Pagination } from "../../../shared/domain/pagination.js";
import type { Paginated } from "../../../shared/domain/paginated.js";
import { PrismaErrorMapper } from "../../../shared/database/prisma/PrismaErrorMapper.js";
import { VentaMapper } from "./mappers/venta.mapper.js";

export class PrismaVentaRepository implements VentaRepository {
    constructor(private readonly db: PrismaClient) { }

    async registrar(data: VentaCrear, negocio_id: string, sucursal_id: string, usuario_id: string): Promise<VentaSimple> {
        try {
            return await this.db.$transaction(async (tx) => {
                let totalVenta = 0;
                let totalCosto = 0;
                const detallesToCreate: any[] = [];
                const lotesAActualizar: Array<{ id: string; cantidad: number }> = [];

                for (const prodInput of data.productos) {
                    const lote = await tx.lote.findFirst({
                        where: {
                            producto_id: prodInput.producto_id,
                            sucursal_id,
                            activo: true,
                            cantidad_actual: { gt: 0 }
                        },
                        orderBy: { fecha_ingreso: 'asc' },
                        include: { producto: true }
                    });

                    if (!lote) {
                        throw new Error(`INSUFICIENTE_STOCK_${prodInput.producto_id}`);
                    }
                    if (!lote.producto) {
                        throw new Error(`PRODUCTO_NO_ENCONTRADO_${prodInput.producto_id}`);
                    }

                    const subtotal = prodInput.cantidad * lote.producto.precio_sugerido;
                    detallesToCreate.push({
                        lote_id: lote.id,
                        descripcion: lote.producto.nombre,
                        cantidad: prodInput.cantidad,
                        precio_unitario: lote.producto.precio_sugerido,
                        costo_unitario: lote.costo_compra
                    });

                    lotesAActualizar.push({ id: lote.id, cantidad: prodInput.cantidad });

                    totalVenta += subtotal;
                    totalCosto += prodInput.cantidad * lote.costo_compra;
                }

                const venta = await tx.venta.create({
                    data: {
                        negocio_id,
                        sucursal_id,
                        usuario_id,
                        cliente_id: data.cliente_id ?? null,
                        estado: data.estado,
                        metodo_pago: data.metodo_pago,
                        total: totalVenta,
                        total_costo: totalCosto,
                        detalles: { create: detallesToCreate }
                    },
                    include: { usuario: true, cliente: true, detalles: { include: { lote: { include: { producto: true } } } } }
                });

                // Decrementar stock en lotes
                for (const loteUpdate of lotesAActualizar) {
                    await tx.lote.update({
                        where: { id: loteUpdate.id },
                        data: { cantidad_actual: { decrement: loteUpdate.cantidad } }
                    });
                }

                return VentaMapper.mapSimple(venta);
            }, { maxWait: 5000, timeout: 20000 });
        } catch (error: any) {
            if (error instanceof Error && (error.message.includes("INSUFICIENTE_STOCK") || error.message.includes("PRODUCTO_NO_ENCONTRADO"))) {
                throw error;
            }
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

    async anular(id: string, negocio_id: string, sucursal_id: string): Promise<VentaSimple> {
        try {
            return await this.db.$transaction(async (tx) => {
                const ventaActual = await tx.venta.findFirst({
                    where: { id, negocio_id, sucursal_id, activo: true }
                });

                if (!ventaActual) throw new Error("VENTA_NO_ENCONTRADA");
                if (ventaActual.estado === 'ANULADA') throw new Error("VENTA_YA_ANULADA");

                const ventaUpdated = await tx.venta.update({
                    where: { id, negocio_id, sucursal_id },
                    data: { estado: 'ANULADA' },
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
