import type { PrismaClient } from "@prisma/client";
import type {
    ProductoActualizar,
    ProductoCrear,
    ProductoSimple,
    ProductoDetalle,
    ProductoImagen,

    ProductoImagenCrear,
    ProductoImagenActualizar
} from "../domain/producto.entity.js";
import type { ProductoRepository } from "../domain/producto.repository.js";
import { ProductoMapper } from "./mappers/producto.mapper.js";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";
import type { Pagination } from "@shared/domain/pagination.js";
import type { Paginated } from "@shared/domain/paginated.js";

export class PrismaProductoRepository implements ProductoRepository {
    private readonly include = {
        categorias: true,
        producto_imagenes: true
    };

    constructor(private readonly prisma: PrismaClient) { }

    async obtener(id: string, negocio_id: string): Promise<ProductoDetalle | null> {
        const producto = await this.prisma.productos.findFirst({
            where: { id, negocio_id },
            include: this.include
        });

        if (!producto) return null;

        return ProductoMapper.mapDetalle(producto as any);
    }

    async listar(negocio_id: string, pagination: Pagination, categoria_id?: string): Promise<Paginated<ProductoSimple>> {
        const { page, perPage } = pagination;
        const offset = (page - 1) * perPage;

        const where: any = { negocio_id };
        if (categoria_id) where.categoria_id = categoria_id;

        const [total, productos] = await Promise.all([
            this.prisma.productos.count({ where }),
            this.prisma.productos.findMany({
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
            const nuevoProducto = await this.prisma.productos.create({
                data: {
                    ...producto,
                    negocio_id
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
            const productoActualizada = await this.prisma.productos.update({
                where: { id, negocio_id },
                data: producto,
                include: this.include
            });

            return ProductoMapper.mapDetalle(productoActualizada as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }


    async eliminar(id: string, negocio_id: string): Promise<void> {
        try {
            await this.prisma.productos.delete({
                where: { id, negocio_id }
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    // Imagenes
    async registrarImagen(imagen: ProductoImagenCrear): Promise<ProductoImagen> {
        try {
            const nuevaImagen = await this.prisma.producto_imagenes.create({
                data: imagen
            });

            return ProductoMapper.mapImagen(nuevaImagen);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizarImagen(id: string, data: ProductoImagenActualizar): Promise<ProductoImagen> {
        try {
            const imagenActualizada = await this.prisma.producto_imagenes.update({
                where: { id },
                data
            });

            return ProductoMapper.mapImagen(imagenActualizada);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminarImagen(id: string): Promise<void> {
        try {
            await this.prisma.producto_imagenes.delete({
                where: { id }
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminarImagenesBulk(ids: string[]): Promise<void> {
        try {
            await this.prisma.producto_imagenes.deleteMany({
                where: { id: { in: ids } }
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtenerImagen(id: string): Promise<ProductoImagen | null> {
        const imagen = await this.prisma.producto_imagenes.findUnique({
            where: { id }
        });

        if (!imagen) return null;

        return ProductoMapper.mapImagen(imagen);
    }
}
