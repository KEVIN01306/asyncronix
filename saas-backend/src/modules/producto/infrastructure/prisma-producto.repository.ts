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

export class PrismaProductoRepository implements ProductoRepository {
    private readonly include = {
        categoria: true
    };

    constructor(private readonly prisma: PrismaClient) { }

    async obtener(id: string, negocio_id: string): Promise<ProductoDetalle | null> {
        const producto = await this.prisma.producto.findFirst({
            where: { id, negocio_id, activo: true },
            include: this.include
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
                include: this.include,
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
            const nuevoProducto = await this.prisma.producto.create({
                data: {
                    ...producto,
                    negocio_id,
                    activo: true,
                    url_imagen: producto.url_imagen ?? ''
                },
                include: this.include
            });

            return ProductoMapper.mapDetalle(nuevoProducto as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizar(id: string, producto: ProductoActualizar, negocio_id: string): Promise<ProductoDetalle> {
        try {
            const productoActualizado = await this.prisma.producto.update({
                where: { id },
                data: producto,
                include: this.include
            });

            return ProductoMapper.mapDetalle(productoActualizado as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }


    async actualizarSku(id: string, negocio_id: string, newSku: string): Promise<ProductoDetalle> {
        try {
            const productoActualizado = await this.prisma.producto.update({
                where: { id },
                data: {
                    sku: newSku
                },
                include: this.include
            });

            return ProductoMapper.mapDetalle(productoActualizado as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminar(id: string, negocio_id: string): Promise<void> {
        try {
            await this.prisma.producto.update({
                where: { id },
                data: {
                    activo: false
                }
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtenerPorSku(sku: string, negocio_id: string): Promise<ProductoDetalle | null> {
        const producto = await this.prisma.producto.findFirst({
            where: { sku, negocio_id, activo: true },
            include: this.include
        });

        if (!producto) return null;
        return ProductoMapper.mapDetalle(producto as any);
    }

    async registrarImagen(producto_id: string, url_imagen: string, negocio_id: string): Promise<ProductoDetalle> {
        try {
            const existing = await this.prisma.producto.findFirst({
                where: { id: producto_id, negocio_id }
            });

            if (!existing) throw new Error('Producto no encontrado');

            const productoActualizado = await this.prisma.producto.update({
                where: { id: producto_id },
                data: { url_imagen },
                include: this.include
            });

            return ProductoMapper.mapDetalle(productoActualizado as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizarQrImagen(producto_id: string, qr_imagen: string, negocio_id: string): Promise<ProductoDetalle> {
        try {
            const existing = await this.prisma.producto.findFirst({
                where: { id: producto_id, negocio_id }
            });

            if (!existing) throw new Error('Producto no encontrado');

            const productoActualizado = await this.prisma.producto.update({
                where: { id: producto_id },
                data: { qr_imagen },
                include: this.include
            });

            return ProductoMapper.mapDetalle(productoActualizado as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
