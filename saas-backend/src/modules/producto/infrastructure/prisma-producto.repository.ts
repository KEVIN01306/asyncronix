import type { PrismaClient } from "@prisma/client";
import type {
    ImagenProducto,
    ProductoActualizar,
    ProductoAtributo,
    ProductoCrear,
    ProductoDetalle,
    ProductoSimple
} from "../domain/producto.entity.js";
import type { ProductoRepository } from "../domain/producto.repository.js";
import { ProductoMapper } from "./mappers/producto.mapper.js";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";
import AppError from "@shared/errors/AppError.js";
import type { Pagination } from "@shared/domain/pagination.js";
import type { Paginated } from "@shared/domain/paginated.js";
import { GenerarSku } from "../domain/actions/generarSku.action.js";

export class PrismaProductoRepository implements ProductoRepository {
    private readonly includeList = {
        categoria: true,
        marca: true,
        imagenes: {
            orderBy: [{ es_principal: 'desc' as const }, { created_at: 'asc' as const }]
        },
        variantes: {
            where: { activo: true },
            orderBy: { created_at: 'asc' as const },
            include: {
                imagen: true,
                valores: { include: { atributo: true } }
            }
        }
    };

    private readonly includeDetail = {
        categoria: true,
        marca: true,
        imagenes: {
            orderBy: [{ es_principal: 'desc' as const }, { created_at: 'asc' as const }]
        },
        productoAtributos: {
            orderBy: { orden: 'asc' as const },
            include: {
                atributo: {
                    include: {
                        valores: true
                    }
                }
            }
        },
        variantes: {
            where: { activo: true },
            orderBy: { created_at: 'asc' as const },
            include: {
                imagen: true,
                valores: { include: { atributo: true } }
            }
        }
    };

    constructor(private readonly prisma: PrismaClient) { }

    async obtener(id: string, negocio_id: string): Promise<ProductoDetalle | null> {
        const producto = await this.prisma.producto.findFirst({
            where: { id, negocio_id, activo: true },
            include: {
                ...this.includeDetail,
                negocio: true
            }
        });

        if (!producto) return null;

        const varianteIds = (producto.variantes ?? []).map((v: any) => v.id).filter(Boolean);
        if (varianteIds.length > 0) {
            const grupos = await this.prisma.lote.groupBy({
                by: ['variante_id'],
                where: { variante_id: { in: varianteIds }, activo: true },
                _sum: { cantidad_actual: true }
            });

            const sumaPorVariante: Record<string, number> = {};
            for (const g of grupos) {
                sumaPorVariante[g.variante_id] = (g._sum.cantidad_actual ?? 0) as number;
            }

            for (const v of producto.variantes ?? []) {
                (v as any).stock_total = sumaPorVariante[v.id] ?? 0;
            }
        }

        return ProductoMapper.mapDetalle(producto as any);
    }

    async listar(negocio_id: string, pagination: Pagination, categoria_id?: string, q?: string | null, sku?: string | null): Promise<Paginated<ProductoSimple>> {
        const { page, perPage } = pagination;
        const offset = (page - 1) * perPage;

        const where: any = { negocio_id, activo: true };
        if (categoria_id) where.categoria_id = categoria_id;

        if (q) {
            where.OR = [
                { nombre: { contains: q } },
                { variantes: { some: { codigo_barras: { contains: q } } } },
                { sku: { contains: q } },
                { variantes: { some: { sku: { contains: q } } } },
                { variantes: { some: { qr_codigo: { contains: q } } } }
            ];
        }

        if (sku) {
            if (where.OR) {
                where.AND = [{ OR: where.OR }, { sku: { contains: sku } }];
                delete where.OR;
            } else {
                where.sku = { contains: sku };
            }
        }

        const [total, productos] = await Promise.all([
            this.prisma.producto.count({ where }),
            this.prisma.producto.findMany({
                where,
                take: perPage,
                skip: offset,
                include: this.includeList,
                orderBy: { nombre: 'asc' }
            })
        ]);

        const varianteIds: string[] = [];
        for (const p of productos) {
            const vars = (p.variantes ?? []).map((v: any) => v.id).filter(Boolean);
            varianteIds.push(...vars);
        }

        if (varianteIds.length > 0) {
            const grupos = await this.prisma.lote.groupBy({
                by: ['variante_id'],
                where: { variante_id: { in: varianteIds }, activo: true },
                _sum: { cantidad_actual: true }
            });

            const sumaPorVariante: Record<string, number> = {};
            for (const g of grupos) {
                sumaPorVariante[g.variante_id] = (g._sum.cantidad_actual ?? 0) as number;
            }

            for (const p of productos) {
                for (const v of (p.variantes ?? [])) {
                    (v as any).stock_total = sumaPorVariante[v.id] ?? 0;
                }
            }
        }

        return {
            data: productos.map((producto) => ProductoMapper.mapSimple(producto as any)),
            total,
            page,
            perPage
        };
    }

    async listarAtributosProducto(producto_id: string, negocio_id: string): Promise<ProductoAtributo[] | null> {
        const producto = await this.prisma.producto.findFirst({
            where: { id: producto_id, negocio_id, activo: true },
            include: {
                productoAtributos: {
                    orderBy: { orden: 'asc' as const },
                    where: { atributo: { activo: true } },
                    include: {
                        atributo: { include: { valores: true } }
                    }
                }
            }
        });

        if (!producto) return null;

        return producto.productoAtributos.map((item: any) => ({
            id: item.atributo.id,
            nombre: item.atributo.nombre,
            orden: item.orden,
            valores: (item.atributo.valores || []).map((v: any) => ({ id: v.id, valor: v.valor }))
        }));
    }

    async actualizarAtributosProducto(producto_id: string, negocio_id: string, atributo_ids: string[]): Promise<ProductoAtributo[] | null> {
        const producto = await this.prisma.producto.findFirst({
            where: { id: producto_id, negocio_id, activo: true },
            include: { productoAtributos: { include: { atributo: true } } }
        });

        if (!producto) return null;

        const currentAtributoIds = (producto.productoAtributos ?? []).map((item: any) => item.atributo_id);
        const removedAtributoIds = currentAtributoIds.filter((id: string) => !atributo_ids.includes(id));

        if (removedAtributoIds.length > 0) {
            const variantInUse = await this.prisma.varianteProducto.findFirst({
                where: {
                    producto_id,
                    activo: true,
                    valores: { some: { atributo_id: { in: removedAtributoIds } } }
                }
            });

            if (variantInUse) {
                throw new AppError('No se puede eliminar un atributo que está siendo usado por una variante', 'ATRIBUTO_EN_USO', 400);
            }
        }

        const transactionActions = [];

        if (removedAtributoIds.length > 0) {
            transactionActions.push(this.prisma.productoAtributo.deleteMany({
                where: { producto_id, atributo_id: { in: removedAtributoIds } }
            }));
        }

        for (const [orden, atributo_id] of atributo_ids.map((id, index) => [index, id] as const)) {
            transactionActions.push(this.prisma.productoAtributo.upsert({
                where: { producto_id_atributo_id: { producto_id, atributo_id } },
                update: { orden },
                create: { producto_id, atributo_id, orden }
            }));
        }

        await this.prisma.$transaction(transactionActions as any);

        const updatedProducto = await this.prisma.producto.findFirst({
            where: { id: producto_id, negocio_id, activo: true },
            include: {
                productoAtributos: {
                    orderBy: { orden: 'asc' as const },
                    where: { atributo: { activo: true } },
                    include: { atributo: { include: { valores: true } } }
                }
            }
        });

        if (!updatedProducto) return null;

        return updatedProducto.productoAtributos.map((item: any) => ({
            id: item.atributo.id,
            nombre: item.atributo.nombre,
            orden: item.orden,
            valores: (item.atributo.valores || []).map((v: any) => ({ id: v.id, valor: v.valor }))
        }));
    }

    async registrar(producto: ProductoCrear, negocio_id: string): Promise<ProductoDetalle> {
        try {
            const { sku: _sku, precio_sugerido: _precio_sugerido, ...productoData } = producto as any;

            const categoria = await this.prisma.categoriaProducto.findFirst({
                where: { id: producto.categoria_id, activo: true }
            });

            if (!categoria) throw new AppError('Categoria no encontrada', 'CATEGORIA_NOT_FOUND', 404);

            const correlativo = await this.obtenerSiguienteCorrelativoProducto(negocio_id);
            const sku = GenerarSku.generarSkuProducto(categoria.categoria, correlativo);

            const createdProduct = await this.prisma.producto.create({
                data: {
                    ...productoData,
                    negocio_id,
                    sku,
                    correlativo: String(correlativo),
                    activo: true
                },
                include: {
                    categoria: true,
                    marca: true,
                    negocio: true,
                    imagenes: true
                }
            });

            return ProductoMapper.mapDetalle(createdProduct as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizar(id: string, producto: ProductoActualizar, negocio_id: string): Promise<ProductoDetalle> {
        try {
            const { sku: _sku, precio_sugerido: _precio_sugerido, ...productoData } = producto as any;

            const result = await this.prisma.producto.updateMany({
                where: { id, negocio_id },
                data: productoData
            });

            if (result.count === 0) throw new Error('Producto no encontrado');

            const productoActualizado = await this.prisma.producto.findFirst({
                where: { id, negocio_id },
                include: {
                    ...this.includeDetail,
                    negocio: true
                }
            });

            if (!productoActualizado) throw new Error('Producto no encontrado');

            return ProductoMapper.mapDetalle(productoActualizado as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    private async obtenerSiguienteCorrelativoProducto(negocio_id: string): Promise<number> {
        const productos = await this.prisma.producto.findMany({
            where: { negocio_id, correlativo: { not: null } },
            select: { correlativo: true }
        });

        const ultimo = productos.reduce((max, producto) => {
            const valor = Number(producto.correlativo ?? 0);
            return Number.isFinite(valor) ? Math.max(max, valor) : max;
        }, 0);

        return ultimo + 1;
    }

    async eliminar(id: string, negocio_id: string): Promise<void> {
        try {
            const [productResult] = await this.prisma.$transaction([
                this.prisma.producto.updateMany({
                    where: { id, negocio_id },
                    data: { activo: false }
                }),
                this.prisma.varianteProducto.updateMany({
                    where: { producto_id: id, activo: true },
                    data: { activo: false }
                })
            ]);

            if (productResult.count === 0) throw new Error('Producto no encontrado');
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async registrarImagen(producto_id: string, url: string, descripcion: string | null, negocio_id: string): Promise<ProductoDetalle> {
        try {
            const producto = await this.prisma.producto.findFirst({
                where: { id: producto_id, negocio_id, activo: true },
                include: { imagenes: true }
            });

            if (!producto) throw new Error('Producto no encontrado');

            const esPrimeraImagen = (producto.imagenes?.length ?? 0) === 0;
            await this.prisma.imagenProducto.create({
                data: {
                    producto_id,
                    url,
                    descripcion,
                    es_principal: esPrimeraImagen
                }
            });

            const updated = await this.prisma.producto.findFirst({
                where: { id: producto_id, negocio_id, activo: true },
                include: {
                    ...this.includeDetail,
                    negocio: true
                }
            });

            if (!updated) throw new Error('Producto no encontrado');
            return ProductoMapper.mapDetalle(updated as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async listarImagenes(producto_id: string, negocio_id: string): Promise<ImagenProducto[]> {
        try {
            const producto = await this.prisma.producto.findFirst({
                where: { id: producto_id, negocio_id, activo: true },
                select: { id: true }
            });

            if (!producto) throw new Error('Producto no encontrado');

            const imagenes = await this.prisma.imagenProducto.findMany({
                where: { producto_id },
                orderBy: [{ es_principal: 'desc' }, { created_at: 'asc' }]
            });

            return imagenes.map((img) => ({
                id: img.id,
                producto_id: img.producto_id,
                url: img.url,
                descripcion: img.descripcion,
                es_principal: img.es_principal,
                created_at: img.created_at,
                updated_at: img.updated_at
            }));
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtenerImagen(imagen_id: string, negocio_id: string): Promise<ImagenProducto | null> {
        try {
            const imagen = await this.prisma.imagenProducto.findFirst({
                where: {
                    id: imagen_id,
                    producto: {
                        negocio_id,
                        activo: true
                    }
                }
            });

            if (!imagen) return null;

            return {
                id: imagen.id,
                producto_id: imagen.producto_id,
                url: imagen.url,
                descripcion: imagen.descripcion,
                es_principal: imagen.es_principal,
                created_at: imagen.created_at,
                updated_at: imagen.updated_at
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizarArchivoImagen(imagen_id: string, url: string, negocio_id: string): Promise<ImagenProducto> {
        try {
            const existing = await this.prisma.imagenProducto.findFirst({
                where: {
                    id: imagen_id,
                    producto: {
                        negocio_id,
                        activo: true
                    }
                }
            });

            if (!existing) throw new Error('Imagen no encontrada');

            const updated = await this.prisma.imagenProducto.update({
                where: { id: imagen_id },
                data: { url }
            });

            return {
                id: updated.id,
                producto_id: updated.producto_id,
                url: updated.url,
                descripcion: updated.descripcion,
                es_principal: updated.es_principal,
                created_at: updated.created_at,
                updated_at: updated.updated_at
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizarDescripcionImagen(imagen_id: string, descripcion: string | null, negocio_id: string): Promise<ImagenProducto> {
        try {
            const existing = await this.prisma.imagenProducto.findFirst({
                where: {
                    id: imagen_id,
                    producto: {
                        negocio_id,
                        activo: true
                    }
                }
            });

            if (!existing) throw new Error('Imagen no encontrada');

            const updated = await this.prisma.imagenProducto.update({
                where: { id: imagen_id },
                data: { descripcion }
            });

            return {
                id: updated.id,
                producto_id: updated.producto_id,
                url: updated.url,
                descripcion: updated.descripcion,
                es_principal: updated.es_principal,
                created_at: updated.created_at,
                updated_at: updated.updated_at
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async establecerImagenPrincipal(imagen_id: string, negocio_id: string): Promise<ImagenProducto> {
        try {
            const selected = await this.prisma.imagenProducto.findFirst({
                where: {
                    id: imagen_id,
                    producto: {
                        negocio_id,
                        activo: true
                    }
                }
            });

            if (!selected) throw new Error('Imagen no encontrada');

            const updated = await this.prisma.$transaction(async (tx) => {
                await tx.imagenProducto.updateMany({
                    where: {
                        producto_id: selected.producto_id,
                        es_principal: true,
                        NOT: { id: selected.id }
                    },
                    data: { es_principal: false }
                });

                return tx.imagenProducto.update({
                    where: { id: selected.id },
                    data: { es_principal: true }
                });
            });

            return {
                id: updated.id,
                producto_id: updated.producto_id,
                url: updated.url,
                descripcion: updated.descripcion,
                es_principal: updated.es_principal,
                created_at: updated.created_at,
                updated_at: updated.updated_at
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminarImagen(imagen_id: string, negocio_id: string): Promise<void> {
        try {
            const imagen = await this.prisma.imagenProducto.findFirst({
                where: {
                    id: imagen_id,
                    producto: {
                        negocio_id,
                        activo: true
                    }
                }
            });

            if (!imagen) throw new Error('Imagen no encontrada');

            await this.prisma.$transaction(async (tx) => {
                await tx.varianteProducto.updateMany({
                    where: { imagen_id: imagen.id },
                    data: { imagen_id: null }
                });

                await tx.imagenProducto.delete({
                    where: { id: imagen.id }
                });
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async contar(negocio_id: string): Promise<number> {
        try {
            return await this.prisma.producto.count({
                where: { negocio_id, activo: true }
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
