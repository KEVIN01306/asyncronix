import type { PrismaClient } from "@prisma/client";
import type {
    ProductoActualizar,
    ProductoCrear,
    ProductoSimple,
    ProductoDetalle
} from "../domain/producto.entity.js";
import type { ProductoRepository } from "../domain/producto.repository.js";
import { ProductoMapper } from "./mappers/producto.mapper.js";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";
import type { Pagination } from "@shared/domain/pagination.js";
import type { Paginated } from "@shared/domain/paginated.js";
import { GenerarSku } from "../domain/actions/generarSku.action.js";

export class PrismaProductoRepository implements ProductoRepository {
    private readonly includeList = {
        categoria: true,
        variantes: {
            where: { activo: true },
            orderBy: { created_at: 'asc' as const },
            include: { valores: { include: { atributo: true } } }
        }
    };

    private readonly includeDetail = {
        categoria: true,
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
            include: this.includeDetail
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
                    negocio: true
                }
            });

            // Generate product code (codigo) if not provided
            let productoCodigo = createdProduct.codigo?.trim();
            if (!productoCodigo) {
                productoCodigo = GenerarSku.ejecutar({
                    negocioCodigo: createdProduct.negocio.slug,
                    categoriaCodigo: createdProduct.categoria?.codigo ?? createdProduct.categoria?.categoria ?? '',
                    productoCodigo: createdProduct.nombre
                });

                // Update product with generated codigo
                await this.prisma.producto.update({
                    where: { id: createdProduct.id },
                    data: { codigo: productoCodigo }
                });
            }

            // Generate variant SKU independently from product codigo
            const varianteSku = GenerarSku.ejecutar({
                negocioCodigo: createdProduct.negocio.slug,
                categoriaCodigo: createdProduct.categoria?.codigo ?? createdProduct.categoria?.categoria ?? '',
                productoCodigo: productoCodigo
            });

            await this.prisma.varianteProducto.create({
                data: {
                    producto_id: createdProduct.id,
                    sku: varianteSku,
                    codigo_barras: null,
                    qr_codigo: null,
                    precio_sugerido: 0,
                    stock_total: 0,
                    activo: true,
                    url_imagen: createdProduct.url_imagen
                }
            });

            const nuevoProducto = await this.prisma.producto.findFirst({
                where: { id: createdProduct.id, negocio_id },
                include: this.includeDetail
            });

            if (!nuevoProducto) throw new Error('Producto no encontrado');

            return ProductoMapper.mapDetalle(nuevoProducto as any);
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

            const productoActualizado = await this.prisma.producto.findFirst({
                where: { id, negocio_id },
                include: this.includeDetail
            });

            if (!productoActualizado) throw new Error('Producto no encontrado');

            return ProductoMapper.mapDetalle(productoActualizado as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminar(id: string, negocio_id: string): Promise<void> {
        try {
            const result = await this.prisma.producto.updateMany({
                where: { id, negocio_id },
                data: {
                    activo: false
                }
            });

            if (result.count === 0) throw new Error('Producto no encontrado');
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
