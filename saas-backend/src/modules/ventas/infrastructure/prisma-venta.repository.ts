import type { PrismaClient } from "@prisma/client";
import type { VentaRepository } from "../domain/venta.repository.js";
import type { VentaSimple, VentaCrear, VentaActualizar } from "../domain/venta.entity.js";
import type { Pagination } from "../../../shared/domain/pagination.js";
import type { Paginated } from "../../../shared/domain/paginated.js";
import { PrismaErrorMapper } from "../../../shared/database/prisma/PrismaErrorMapper.js";

export class PrismaVentaRepository implements VentaRepository {
    constructor(private readonly db: PrismaClient) { }

    private mapVenta(venta: any): VentaSimple {
        return {
            id: venta.id,
            negocio_id: venta.negocio_id,
            sucursal_id: venta.sucursal_id,
            usuario_id: venta.usuario_id,
            cliente_id: venta.cliente_id,
            total: venta.total,
            total_costo: venta.total_costo,
            estado: venta.estado,
            metodo_pago: venta.metodo_pago,
            created_at: venta.created_at,
            updated_at: venta.updated_at,
            vendedor_nombre: `${venta.usuario.nombre} ${venta.usuario.apellido || ''}`.trim(),
            cliente_nombre: venta.cliente ? `${venta.cliente.nombre} ${venta.cliente.apellido || ''}`.trim() : undefined,
            detalles: venta.detalles.map((d: any) => ({
                id: d.id,
                lote_id: d.lote_id,
                descripcion: d.descripcion,
                cantidad: d.cantidad,
                precio_unitario: d.precio_unitario,
                costo_unitario: d.costo_unitario,
                subtotal: d.cantidad * d.precio_unitario
            }))
        };
    }

    async registrar(data: VentaCrear, negocio_id: string, sucursal_id: string, usuario_id: string): Promise<VentaSimple> {
        try {
            return await this.db.$transaction(async (tx) => {
                let totalVenta = 0;
                let totalCosto = 0;
                const detallesToCreate: any[] = [];

                for (const prodInput of data.productos) {
                    const producto = await tx.producto.findUnique({ where: { id: prodInput.producto_id } });
                    if (!producto) throw new Error(`PRODUCTO_NO_ENCONTRADO_${prodInput.producto_id}`);

                    let cantidadRestante = prodInput.cantidad;

                    const lotes = await tx.lote.findMany({
                        where: { producto_id: prodInput.producto_id, sucursal_id, activo: true, cantidad_actual: { gt: 0 } },
                        orderBy: { fecha_ingreso: 'asc' }
                    });

                    let loteIndex = 0;
                    while (cantidadRestante > 0) {
                        if (loteIndex >= lotes.length) {
                            throw new Error(`INSUFICIENTE_STOCK_${producto.nombre}`);
                        }
                        const lote = lotes[loteIndex];
                        const cantidadTomar = Math.min(cantidadRestante, lote.cantidad_actual);
                        
                        await tx.lote.update({
                            where: { id: lote.id },
                            data: { cantidad_actual: lote.cantidad_actual - cantidadTomar }
                        });

                        detallesToCreate.push({
                            lote_id: lote.id,
                            descripcion: producto.nombre,
                            cantidad: cantidadTomar,
                            precio_unitario: producto.precio_sugerido,
                            costo_unitario: lote.costo_compra
                        });

                        totalVenta += cantidadTomar * producto.precio_sugerido;
                        totalCosto += cantidadTomar * lote.costo_compra;
                        cantidadRestante -= cantidadTomar;
                        loteIndex++;
                    }
                    
                    // Deduct from total stock of product
                    await tx.producto.update({
                        where: { id: producto.id },
                        data: { stock_total: { decrement: prodInput.cantidad } }
                    });
                }

                const venta = await tx.venta.create({
                    data: {
                        negocio_id,
                        sucursal_id,
                        usuario_id,
                        cliente_id: data.cliente_id,
                        estado: data.estado,
                        metodo_pago: data.metodo_pago,
                        total: totalVenta,
                        total_costo: totalCosto,
                        detalles: {
                            create: detallesToCreate
                        }
                    },
                    include: { usuario: true, cliente: true, detalles: true }
                });

                return this.mapVenta(venta);
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizar(id: string, data: VentaActualizar, negocio_id: string, sucursal_id: string): Promise<VentaSimple> {
        try {
            return await this.db.$transaction(async (tx) => {
                const ventaActual = await tx.venta.findFirst({
                    where: { id, negocio_id, sucursal_id, activo: true },
                    include: { detalles: true }
                });
                
                if (!ventaActual) throw new Error("VENTA_NO_ENCONTRADA");
                if (ventaActual.estado === 'COMPLETADA' || ventaActual.estado === 'ANULADA') {
                    throw new Error("VENTA_NO_EDITABLE");
                }

                // If updating products, we must revert previous stock and deduct new stock
                let totalVenta = ventaActual.total;
                let totalCosto = ventaActual.total_costo;

                if (data.productos) {
                    // Revert old details
                    for (const detalle of ventaActual.detalles) {
                        if (detalle.lote_id) {
                            await tx.lote.update({
                                where: { id: detalle.lote_id },
                                data: { cantidad_actual: { increment: detalle.cantidad } }
                            });
                            const lote = await tx.lote.findUnique({ where: { id: detalle.lote_id } });
                            if (lote) {
                                await tx.producto.update({
                                    where: { id: lote.producto_id },
                                    data: { stock_total: { increment: detalle.cantidad } }
                                });
                            }
                        }
                    }
                    
                    await tx.ventaDetalle.deleteMany({ where: { venta_id: id } });

                    totalVenta = 0;
                    totalCosto = 0;
                    const detallesToCreate: any[] = [];

                    for (const prodInput of data.productos) {
                        const producto = await tx.producto.findUnique({ where: { id: prodInput.producto_id } });
                        if (!producto) throw new Error(`PRODUCTO_NO_ENCONTRADO_${prodInput.producto_id}`);

                        let cantidadRestante = prodInput.cantidad;

                        const lotes = await tx.lote.findMany({
                            where: { producto_id: prodInput.producto_id, sucursal_id, activo: true, cantidad_actual: { gt: 0 } },
                            orderBy: { fecha_ingreso: 'asc' }
                        });

                        let loteIndex = 0;
                        while (cantidadRestante > 0) {
                            if (loteIndex >= lotes.length) {
                                throw new Error(`INSUFICIENTE_STOCK_${producto.nombre}`);
                            }
                            const lote = lotes[loteIndex];
                            const cantidadTomar = Math.min(cantidadRestante, lote.cantidad_actual);
                            
                            await tx.lote.update({
                                where: { id: lote.id },
                                data: { cantidad_actual: lote.cantidad_actual - cantidadTomar }
                            });

                            detallesToCreate.push({
                                lote_id: lote.id,
                                descripcion: producto.nombre,
                                cantidad: cantidadTomar,
                                precio_unitario: producto.precio_sugerido,
                                costo_unitario: lote.costo_compra
                            });

                            totalVenta += cantidadTomar * producto.precio_sugerido;
                            totalCosto += cantidadTomar * lote.costo_compra;
                            cantidadRestante -= cantidadTomar;
                            loteIndex++;
                        }
                        
                        await tx.producto.update({
                            where: { id: producto.id },
                            data: { stock_total: { decrement: prodInput.cantidad } }
                        });
                    }
                    
                    await tx.venta.update({
                        where: { id },
                        data: { detalles: { create: detallesToCreate } }
                    });
                }

                const ventaUpdated = await tx.venta.update({
                    where: { id },
                    data: {
                        cliente_id: data.cliente_id !== undefined ? data.cliente_id : ventaActual.cliente_id,
                        metodo_pago: data.metodo_pago !== undefined ? data.metodo_pago : ventaActual.metodo_pago,
                        estado: data.estado !== undefined ? data.estado : ventaActual.estado,
                        total: totalVenta,
                        total_costo: totalCosto
                    },
                    include: { usuario: true, cliente: true, detalles: true }
                });

                return this.mapVenta(ventaUpdated);
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async anular(id: string, negocio_id: string): Promise<VentaSimple> {
        try {
            return await this.db.$transaction(async (tx) => {
                const ventaActual = await tx.venta.findFirst({
                    where: { id, negocio_id, activo: true },
                    include: { detalles: true }
                });
                
                if (!ventaActual) throw new Error("VENTA_NO_ENCONTRADA");
                if (ventaActual.estado === 'ANULADA') throw new Error("VENTA_YA_ANULADA");

                // Return stock
                for (const detalle of ventaActual.detalles) {
                    if (detalle.lote_id) {
                        await tx.lote.update({
                            where: { id: detalle.lote_id },
                            data: { cantidad_actual: { increment: detalle.cantidad } }
                        });
                        const lote = await tx.lote.findUnique({ where: { id: detalle.lote_id } });
                        if (lote) {
                            await tx.producto.update({
                                where: { id: lote.producto_id },
                                data: { stock_total: { increment: detalle.cantidad } }
                            });
                        }
                    }
                }

                const ventaUpdated = await tx.venta.update({
                    where: { id },
                    data: { estado: 'ANULADA' },
                    include: { usuario: true, cliente: true, detalles: true }
                });

                return this.mapVenta(ventaUpdated);
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtener(id: string, negocio_id: string): Promise<VentaSimple | null> {
        const venta = await this.db.venta.findFirst({
            where: { id, negocio_id, activo: true },
            include: { usuario: true, cliente: true, detalles: true }
        });
        if (!venta) return null;
        return this.mapVenta(venta);
    }

    async listar(negocio_id: string, sucursal_id: string, pagination: Pagination): Promise<Paginated<VentaSimple>> {
        const { page, perPage } = pagination;
        const offset = (page - 1) * perPage;

        const where = { negocio_id, sucursal_id, activo: true };

        const [total, ventas] = await Promise.all([
            this.db.venta.count({ where }),
            this.db.venta.findMany({
                where,
                include: { usuario: true, cliente: true, detalles: true },
                take: perPage,
                skip: offset,
                orderBy: { created_at: 'desc' }
            })
        ]);

        return {
            data: ventas.map(v => this.mapVenta(v)),
            total,
            page,
            perPage
        };
    }
}
