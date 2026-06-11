import type { PrismaClient } from "@prisma/client";
import type {
    ProductoActualizar,
    ProductoAtributo,
    ProductoCrear,
    ProductoSimple,
    ProductoDetalle
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
        variantes: {
            where: { activo: true },
            orderBy: { created_at: 'asc' as const },
            include: { valores: { include: { atributo: true } } }
        }
    };

    private readonly includeDetail = {
        categoria: true,
        marca: true,
        atributos: {
            where: { activo: true }
        },
        variantes: {
            where: { activo: true },
            orderBy: { created_at: 'asc' as const },
            include: { valores: { include: { atributo: true } } }
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

        // Calcular stock_total por variante (suma de cantidad_actual en lotes activos)
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

    async listar(negocio_id: string, pagination: Pagination, categoria_id?: string): Promise<Paginated<ProductoSimple>> {
        const { page, perPage } = pagination;
        const offset = (page - 1) * perPage;

        const where: any = { negocio_id, activo: true };
        if (categoria_id) where.categoria_id = categoria_id;

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

        // Agregar stock_total por variante para cada producto
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
            data: productos.map(producto => ProductoMapper.mapSimple(producto as any)),
            total,
            page,
            perPage
        };
    }

    async listarAtributosProducto(producto_id: string, negocio_id: string): Promise<ProductoAtributo[] | null> {
        const producto = await this.prisma.producto.findFirst({
            where: { id: producto_id, negocio_id, activo: true },
            include: { atributos: { where: { activo: true }, include: { valores: true } } }
        });

        if (!producto) return null;

        return producto.atributos.map((atributo: any) => ({
            id: atributo.id,
            nombre: atributo.nombre,
            valores: (atributo.valores || []).map((v: any) => ({ id: v.id, valor: v.valor, atributo_id: v.atributo_id }))
        }));
    }

    async actualizarAtributosProducto(producto_id: string, negocio_id: string, atributo_ids: string[]): Promise<ProductoAtributo[] | null> {
        const producto = await this.prisma.producto.findFirst({
            where: { id: producto_id, negocio_id, activo: true },
            include: { atributos: true }
        });

        if (!producto) return null;

        const currentAtributoIds = (producto.atributos ?? []).map((atributo: any) => atributo.id);
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

        const updatedProducto = await this.prisma.producto.update({
            where: { id: producto_id },
            data: {
                atributos: { set: atributo_ids.map((id) => ({ id })) }
            },
            include: { atributos: { where: { activo: true } } }
        });

        return updatedProducto.atributos.map((atributo: any) => ({
            id: atributo.id,
            nombre: atributo.nombre
        }));
    }

    async registrar(producto: ProductoCrear, negocio_id: string): Promise<ProductoDetalle> {
        try {
            const { sku: _sku, precio_sugerido: _precio_sugerido, ...productoData } = producto as any;

            const createdProduct = await this.prisma.producto.create({
                data: {
                    ...productoData,
                    negocio_id,
                    activo: true,
                    url_imagen: productoData.url_imagen ?? ''
                },
                include: {
                    categoria: true,
                    marca: true,
                    negocio: true
                }
            });

            return ProductoMapper.mapDetalle(createdProduct as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizar(id: string, producto: ProductoActualizar, negocio_id: string): Promise<ProductoDetalle> {
        try {
            // Excluir sku y precio_sugerido para que no se modifiquen al actualizar el producto
            // El SKU y precio pertenecen a las variantes, no al producto
            const { sku: _sku, precio_sugerido: _precio_sugerido, ...productoData } = producto as any;

            const result = await this.prisma.producto.updateMany({
                where: { id, negocio_id },
                data: productoData
            });

            if (result.count === 0) throw new Error('Producto no encontrado');

            let productoActualizado = await this.prisma.producto.findFirst({
                where: { id, negocio_id },
                include: {
                    ...this.includeDetail,
                    negocio: true
                }
            });

            if (!productoActualizado) throw new Error('Producto no encontrado');

            let productoCodigo = productoActualizado.codigo?.trim();
            if (!productoCodigo) {
                productoCodigo = GenerarSku.ejecutar({
                    negocioCodigo: productoActualizado.negocio.slug,
                    marcaCodigo: productoActualizado.marca?.marca ?? '',
                    categoriaCodigo: productoActualizado.categoria?.codigo ?? productoActualizado.categoria?.categoria ?? '',
                    productoCodigo: productoActualizado.nombre
                });

                await this.prisma.producto.update({
                    where: { id: productoActualizado.id },
                    data: { codigo: productoCodigo }
                });

                productoActualizado = await this.prisma.producto.findFirst({
                    where: { id, negocio_id },
                    include: {
                        ...this.includeDetail,
                        negocio: true
                    }
                });

                if (!productoActualizado) throw new Error('Producto no encontrado');
            }

            await this.actualizarSkusDeVariantes(productoActualizado);

            return ProductoMapper.mapDetalle(productoActualizado as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    private async actualizarSkusDeVariantes(producto: any): Promise<void> {
        const variantes = await this.prisma.varianteProducto.findMany({
            where: { producto_id: producto.id, activo: true },
            include: { valores: true }
        });

        await Promise.all(variantes.map((variante) => {
            const sku = GenerarSku.ejecutar({
                negocioCodigo: producto.negocio.slug,
                marcaCodigo: producto.marca?.marca ?? '',
                categoriaCodigo: producto.categoria?.codigo ?? producto.categoria?.categoria ?? '',
                productoCodigo: producto.nombre,
                valores: variante.valores?.map((valor: any) => valor.valor) ?? []
            });

            return this.prisma.varianteProducto.update({
                where: { id: variante.id },
                data: { sku }
            });
        }));
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

    async registrarImagen(producto_id: string, url_imagen: string, negocio_id: string): Promise<ProductoDetalle> {
        try {
            const existing = await this.prisma.producto.findFirst({
                where: { id: producto_id, negocio_id }
            });

            if (!existing) throw new Error('Producto no encontrado');

            const result = await this.prisma.producto.updateMany({
                where: { id: producto_id, negocio_id },
                data: { url_imagen }
            });

            if (result.count === 0) throw new Error('Producto no encontrado');

            const productoActualizado = await this.prisma.producto.findFirst({
                where: { id: producto_id, negocio_id },
                include: this.includeDetail
            });

            if (!productoActualizado) throw new Error('Producto no encontrado');

            return ProductoMapper.mapDetalle(productoActualizado as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
