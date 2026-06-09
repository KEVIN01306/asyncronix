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
            take: 1,
            orderBy: { created_at: 'desc' as const }
        }
    };

    private readonly includeDetail = {
        categoria: true,
        variantes: {
            where: { activo: true },
            orderBy: { created_at: 'desc' as const }
        }
    };

    constructor(private readonly prisma: PrismaClient) { }

    async obtener(id: string, negocio_id: string): Promise<ProductoDetalle | null> {
        const producto = await this.prisma.producto.findFirst({
            where: { id, negocio_id, activo: true },
            include: this.includeDetail
        });

        if (!producto) return null;

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

            const sku = GenerarSku.ejecutar({
                negocioCodigo: createdProduct.negocio.slug,
                categoriaCodigo: createdProduct.categoria?.codigo ?? createdProduct.categoria?.categoria ?? '',
                productoCodigo: createdProduct.codigo?.trim() || createdProduct.nombre
            });

            await this.prisma.varianteProducto.create({
                data: {
                    producto_id: createdProduct.id,
                    sku,
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
