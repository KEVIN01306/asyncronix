import { Prisma } from '@prisma/client';
import { PrismaErrorMapper } from '@shared/database/prisma/PrismaErrorMapper.js';

export interface RegularizacionStockNegativoResultado {
    regularizacionAutomatica: boolean;
    stockRegularizado: number;
    stockPendiente: number;
    mensaje: string;
}

interface RegularizacionStockNegativoInput {
    negocio_id: string;
    sucursal_id: string;
    variante_id: string;
    lote_nuevo_id: string;
    stock_nuevo_lote: number;
}

const CODIGO_LOTE_NEGATIVO = 'SYS_LOTE_NEGATIVO';

export class RegularizarStockNegativoUseCase {
    async execute(
        tx: Prisma.TransactionClient,
        input: RegularizacionStockNegativoInput,
    ): Promise<RegularizacionStockNegativoResultado> {
        try {
            const loteNegativo = await tx.lote.findFirst({
                where: {
                    negocio_id: input.negocio_id,
                    sucursal_id: input.sucursal_id,
                    variante_id: input.variante_id,
                    codigo_lote: CODIGO_LOTE_NEGATIVO,
                    activo: true,
                    cantidad_actual: { lt: 0 },
                },
                select: { id: true, cantidad_actual: true },
            });

            if (!loteNegativo) {
                return {
                    regularizacionAutomatica: false,
                    stockRegularizado: 0,
                    stockPendiente: 0,
                    mensaje: 'No se detectó deuda de stock para esta variante.',
                };
            }

            const detallesPendientes = await tx.ventaDetalle.findMany({
                where: {
                    lote_id: loteNegativo.id,
                    variante_id: input.variante_id,
                },
                orderBy: [
                    { created_at: 'asc' },
                    { id: 'asc' },
                ],
            });

            let stockDisponible = Math.max(0, Number(input.stock_nuevo_lote ?? 0));
            let stockRegularizado = 0;

            for (const detalle of detallesPendientes) {
                if (stockDisponible <= 0) break;

                const cantidadOriginal = Number(detalle.cantidad ?? 0);
                if (cantidadOriginal <= 0) {
                    continue;
                }

                const cantidadRegularizada = Math.min(stockDisponible, cantidadOriginal);
                if (cantidadRegularizada <= 0) {
                    continue;
                }

                await tx.ventaDetalle.delete({
                    where: { id: detalle.id },
                });

                await tx.ventaDetalle.create({
                    data: {
                        venta_id: detalle.venta_id,
                        variante_id: detalle.variante_id ?? input.variante_id,
                        lote_id: input.lote_nuevo_id,
                        descripcion: detalle.descripcion,
                        cantidad: cantidadRegularizada,
                        precio_unitario: Number(detalle.precio_unitario),
                        costo_unitario: Number(detalle.costo_unitario ?? 0),
                    },
                });

                stockRegularizado += cantidadRegularizada;
                stockDisponible -= cantidadRegularizada;

                const restante = cantidadOriginal - cantidadRegularizada;
                if (restante > 0) {
                    await tx.ventaDetalle.create({
                        data: {
                            venta_id: detalle.venta_id,
                            variante_id: detalle.variante_id ?? input.variante_id,
                            lote_id: loteNegativo.id,
                            descripcion: detalle.descripcion,
                            cantidad:  restante,
                            precio_unitario: Number(detalle.precio_unitario),
                            costo_unitario: Number(detalle.costo_unitario ?? 0),
                        },
                    });
                    break;
                }
            }

            const loteNegativoActualizado = await tx.lote.findUnique({
                where: { id: loteNegativo.id },
                select: { cantidad_actual: true },
            });

            const stockPendiente = Math.max(0, Math.abs(Number(loteNegativoActualizado?.cantidad_actual ?? 0)));

            return {
                regularizacionAutomatica: true,
                stockRegularizado,
                stockPendiente,
                mensaje: 'La regularización automática del stock finalizó correctamente.',
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}