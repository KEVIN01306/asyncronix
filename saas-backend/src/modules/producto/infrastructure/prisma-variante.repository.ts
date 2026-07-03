import type { PrismaClient } from '@prisma/client';
import type { VarianteActualizar, VarianteCrear, VarianteDetalle } from '../domain/variante.entity.js';
import type { VarianteRepository } from '../domain/variante.repository.js';
import { GenerarSku } from '../domain/actions/generarSku.action.js';
import { PrismaErrorMapper } from '@shared/database/prisma/PrismaErrorMapper.js';
import AppError from '@shared/errors/AppError.js';

export class PrismaVarianteRepository implements VarianteRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async crear(variante: VarianteCrear, negocio_id: string): Promise<VarianteDetalle> {
        try {
            const producto = await this.prisma.producto.findFirst({
                where: { id: variante.producto_id, negocio_id, activo: true },
                include: {
                    imagenes: {
                        where: { es_principal: true },
                        take: 1
                    }
                }
            });

            if (!producto) throw new AppError('Producto no encontrado', 'PRODUCTO_NOT_FOUND', 404);
            if (!producto.sku) throw new AppError('El producto no tiene SKU configurado', 'PRODUCTO_SKU_REQUIRED', 400);

            const valores = variante.valor_atributo_ids?.length
                ? await this.prisma.valorAtributo.findMany({ where: { id: { in: variante.valor_atributo_ids } } })
                : [];

            const correlativo = await this.obtenerSiguienteCorrelativoVariante(negocio_id);
            const sku = GenerarSku.generarSkuVariante(producto.sku, correlativo);
            const qr_codigo = GenerarSku.generarCodigoQrVariante(correlativo);

            let imagen_id = variante.imagen_id ?? null;
            if (!imagen_id) {
                imagen_id = producto.imagenes?.[0]?.id ?? null;
            }

            if (imagen_id) {
                const imagenValida = await this.prisma.imagenProducto.findFirst({
                    where: { id: imagen_id, producto_id: variante.producto_id }
                });
                if (!imagenValida) {
                    throw new AppError('La imagen seleccionada no pertenece al producto', 'IMAGEN_INVALIDA', 400);
                }
            }

            const createData: any = {
                producto_id: variante.producto_id,
                imagen_id,
                sku,
                correlativo: String(correlativo),
                codigo_barras: variante.codigo_barras ?? null,
                qr_codigo,
                precio_sugerido: variante.precio_sugerido,
                stock_total: 0,
                activo: true
            };

            if (variante.valor_atributo_ids && variante.valor_atributo_ids.length) {
                createData.valores = { connect: variante.valor_atributo_ids.map((id) => ({ id })) };
            }

            const created = await this.prisma.varianteProducto.create({
                data: createData,
                include: {
                    imagen: true,
                    producto: { select: { id: true, nombre: true } },
                    valores: { include: { atributo: true } }
                }
            });

            return this.mapToDetalle(created);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizar(id: string, variante: VarianteActualizar, negocio_id: string): Promise<VarianteDetalle> {
        try {
            const existing = await this.prisma.varianteProducto.findFirst({
                where: { id, producto: { negocio_id }, activo: true },
                include: {
                    producto: true,
                    valores: { include: { atributo: true } }
                }
            });

            if (!existing) throw new AppError('Variante no encontrada', 'VARIANTE_NOT_FOUND', 404);

            const valorIds = variante.valor_atributo_ids ?? existing.valores.map((valor) => valor.id);
            const valores = valorIds.length
                ? await this.prisma.valorAtributo.findMany({ where: { id: { in: valorIds } } })
                : [];

            const updateData: any = {
                codigo_barras: variante.codigo_barras === undefined ? existing.codigo_barras : variante.codigo_barras,
                precio_sugerido: variante.precio_sugerido ?? existing.precio_sugerido,
            };

            if (variante.imagen_id !== undefined) {
                if (variante.imagen_id) {
                    const imagenValida = await this.prisma.imagenProducto.findFirst({
                        where: { id: variante.imagen_id, producto_id: existing.producto_id }
                    });
                    if (!imagenValida) {
                        throw new AppError('La imagen seleccionada no pertenece al producto', 'IMAGEN_INVALIDA', 400);
                    }
                }
                updateData.imagen_id = variante.imagen_id;
            }

            if (variante.valor_atributo_ids) {
                updateData.valores = { set: valorIds.map((valor_id) => ({ id: valor_id })) };
            }

            const updated = await this.prisma.varianteProducto.update({
                where: { id },
                data: updateData,
                include: {
                    imagen: true,
                    producto: { select: { id: true, nombre: true } },
                    valores: { include: { atributo: true } }
                }
            });

            return this.mapToDetalle(updated);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminar(id: string, negocio_id: string): Promise<void> {
        try {
            const result = await this.prisma.varianteProducto.updateMany({
                where: { id, producto: { negocio_id }, activo: true },
                data: { activo: false }
            });

            if (result.count === 0) throw new AppError('Variante no encontrada', 'VARIANTE_NOT_FOUND', 404);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtener(id: string, negocio_id: string): Promise<VarianteDetalle | null> {
        try {
            const found = await this.prisma.varianteProducto.findFirst({
                where: { id, producto: { negocio_id }, activo: true },
                include: {
                    imagen: true,
                    producto: { select: { id: true, nombre: true } },
                    valores: { include: { atributo: true } }
                }
            });

            if (!found) return null;
            const agg = await this.prisma.lote.aggregate({ where: { variante_id: found.id, activo: true }, _sum: { cantidad_actual: true } });
            (found as any).stock_total = (agg._sum.cantidad_actual ?? 0) as number;
            return this.mapToDetalle(found);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtenerPorCodigo(codigo: string, negocio_id: string): Promise<VarianteDetalle | null> {
        try {
            const found = await this.prisma.varianteProducto.findFirst({
                where: {
                    producto: { negocio_id },
                    activo: true,
                    OR: [
                        { codigo_barras: codigo },
                        { sku: codigo },
                        { qr_codigo: codigo },
                    ]
                },
                include: {
                    imagen: true,
                    producto: { select: { id: true, nombre: true } },
                    valores: { include: { atributo: true } }
                }
            });

            if (!found) return null;
            const agg = await this.prisma.lote.aggregate({ where: { variante_id: found.id, activo: true }, _sum: { cantidad_actual: true } });
            (found as any).stock_total = (agg._sum.cantidad_actual ?? 0) as number;
            return this.mapToDetalle(found);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async listarPorProducto(producto_id: string, negocio_id: string, sucursal_id: string): Promise<VarianteDetalle[]> {
        try {
            const variantes = await this.prisma.varianteProducto.findMany({
                where: {
                    producto_id,
                    activo: true,
                    producto: { negocio_id }
                },
                include: {
                    imagen: true,
                    producto: { select: { id: true, nombre: true } },
                    valores: { include: { atributo: true } }
                },
                orderBy: { created_at: 'desc' }
            });

            const detalles = variantes.map(this.mapToDetalle);

            const varianteIds = variantes.map(v => v.id);
            if (varianteIds.length > 0) {
                const grupos = await this.prisma.lote.groupBy({
                    by: ['variante_id'],
                    where: { variante_id: { in: varianteIds }, activo: true, sucursal_id },
                    _sum: { cantidad_actual: true }
                });

                const sumaPorVariante: Record<string, number> = {};
                for (const g of grupos) {
                    sumaPorVariante[g.variante_id] = (g._sum.cantidad_actual ?? 0) as number;
                }

                for (const det of detalles) {
                    det.stock_total = sumaPorVariante[det.id] ?? 0;
                }
            }

            return detalles;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async listarPorNegocio(negocio_id: string, sucursal_id?: string): Promise<VarianteDetalle[]> {
        try {
            const variantes = await this.prisma.varianteProducto.findMany({
                where: {
                    activo: true,
                    producto: { negocio_id }
                },
                include: {
                    imagen: true,
                    producto: { select: { id: true, nombre: true } },
                    valores: { include: { atributo: true } }
                },
                orderBy: { created_at: 'desc' }
            });

            const detalles = variantes.map(this.mapToDetalle);
            const varianteIds = variantes.map(v => v.id);

            if (varianteIds.length > 0) {
                const donde: any = { variante_id: { in: varianteIds }, activo: true };
                if (sucursal_id) donde.sucursal_id = sucursal_id;

                const grupos = await this.prisma.lote.groupBy({
                    by: ['variante_id'],
                    where: donde,
                    _sum: { cantidad_actual: true }
                });

                const sumaPorVariante: Record<string, number> = {};
                for (const g of grupos) {
                    sumaPorVariante[g.variante_id] = (g._sum.cantidad_actual ?? 0) as number;
                }

                for (const det of detalles) {
                    det.stock_total = sumaPorVariante[det.id] ?? 0;
                }
            }

            return detalles;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizarCodigoBarras(id: string, codigo_barras: string | null, negocio_id: string): Promise<VarianteDetalle> {
        try {
            const existing = await this.prisma.varianteProducto.findFirst({
                where: { id, producto: { negocio_id }, activo: true },
                include: { imagen: true, producto: { select: { id: true, nombre: true } }, valores: { include: { atributo: true } } }
            });

            if (!existing) throw new AppError('Variante no encontrada', 'VARIANTE_NOT_FOUND', 404);

            const updated = await this.prisma.varianteProducto.update({
                where: { id },
                data: { codigo_barras },
                include: { imagen: true, producto: { select: { id: true, nombre: true } }, valores: { include: { atributo: true } } }
            });

            return this.mapToDetalle(updated);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async generarQr(id: string, negocio_id: string): Promise<VarianteDetalle> {
        try {
            const existing = await this.prisma.varianteProducto.findFirst({
                where: { id, producto: { negocio_id }, activo: true },
                include: { imagen: true, producto: { select: { id: true, nombre: true } }, valores: { include: { atributo: true } } }
            });

            if (!existing) throw new AppError('Variante no encontrada', 'VARIANTE_NOT_FOUND', 404);

            const correlativo = Number(existing.correlativo ?? 0);
            if (!Number.isFinite(correlativo) || correlativo <= 0) {
                throw new AppError('No existe correlativo para generar el código QR', 'CORRELATIVO_REQUIRED', 400);
            }

            const qrCodigo = GenerarSku.generarCodigoQrVariante(correlativo);

            const updated = await this.prisma.varianteProducto.update({
                where: { id },
                data: { qr_codigo: qrCodigo },
                include: { imagen: true, producto: { select: { id: true, nombre: true } }, valores: { include: { atributo: true } } }
            });

            return this.mapToDetalle(updated);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    private mapToDetalle(found: any): VarianteDetalle {
        const detalle: VarianteDetalle = {
            id: found.id,
            producto_id: found.producto_id,
            imagen_id: found.imagen_id,
            sku: found.sku,
            correlativo: found.correlativo,
            codigo_barras: found.codigo_barras,
            qr_codigo: found.qr_codigo,
            precio_sugerido: found.precio_sugerido,
            stock_total: found.stock_total,
            activo: found.activo,
            imagen: found.imagen ? {
                id: found.imagen.id,
                url: found.imagen.url,
                descripcion: found.imagen.descripcion,
                es_principal: found.imagen.es_principal
            } : null,
            valores: found.valores?.map((valor: any) => ({
                id: valor.id,
                atributo_id: valor.atributo_id,
                valor: valor.valor,
                atributo: valor.atributo ? { id: valor.atributo.id, nombre: valor.atributo.nombre } : undefined
            })) ?? []
        };

        if (found.producto) {
            detalle.producto = { id: found.producto.id, nombre: found.producto.nombre };
        }

        return detalle;
    }

    private async obtenerSiguienteCorrelativoVariante(negocio_id: string): Promise<number> {
        const variantes = await this.prisma.varianteProducto.findMany({
            where: { producto: { negocio_id }, correlativo: { not: null } },
            select: { correlativo: true }
        });

        const ultimo = variantes.reduce((max, variante) => {
            const valor = Number(variante.correlativo ?? 0);
            return Number.isFinite(valor) ? Math.max(max, valor) : max;
        }, 0);

        return ultimo + 1;
    }
}
