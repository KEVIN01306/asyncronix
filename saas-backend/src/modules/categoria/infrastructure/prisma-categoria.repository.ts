import type { PrismaClient } from "@prisma/client";
import type { Categoria, CategoriaActualizar, CategoriaCrear, CategoriaSimple } from "../domain/categoria.entity.js";
import type { CategoriaRepository } from "../domain/categoria.repository.js";
import { CategoriaMapper } from "./mappers/categoria.mapper.js";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";
import type { Pagination } from "@shared/domain/pagination.js";
import type { Paginated } from "@shared/domain/paginated.js";
import { NotFoundPersistenceError } from "@shared/database/errors/NotFoundPersistenceError.js";

export class PrismaCategoriaRepository implements CategoriaRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async obtener(id: string, negocio_id: string): Promise<CategoriaSimple | null> {
        try {
            const categoria = await this.prisma.categoriaProducto.findFirst({
                where: {
                    activo: true,
                    id,
                    OR: [
                        { negocio_id },
                        { default_categoria: true }
                    ]
                }
            });

            if (!categoria) return null;

            return CategoriaMapper.mapSimple(categoria);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtenerPorId(id: string, negocio_id: string): Promise<any | null> {
        try {
            const categoria = await this.prisma.categoriaProducto.findFirst({
                where: {
                    activo: true,
                    id,
                    OR: [
                        { negocio_id },
                        { default_categoria: true }
                    ]
                },
                include: {
                    categoria_padre: true,
                    subcategorias: true
                }
            });

            return categoria;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
    async obtenerDefaultPorCategoria(categoriaShared: Categoria['categoria']): Promise<CategoriaSimple | null> {
        try {
            const categoria = await this.prisma.categoriaProducto.findFirst({
                where: {
                    activo: true,
                    categoria: categoriaShared,
                    default_categoria: true
                }
            });

            if (!categoria) return null;

            return CategoriaMapper.mapSimple(categoria);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async listar(negocio_id: string, pagination: Pagination, q?: string | null): Promise<Paginated<CategoriaSimple>> {
        try {
            const { page, perPage } = pagination;
            const offset = (page - 1) * perPage;

            const where: any = {
                activo: true,
                OR: [
                    { negocio_id },
                    { default_categoria: true }
                ]
            };

            if (q) {
                where.AND = [{
                    categoria: { contains: q }
                }];
            }

            const [total, categorias] = await Promise.all([
                this.prisma.categoriaProducto.count({ where }),
                this.prisma.categoriaProducto.findMany({
                    where,
                    take: perPage,
                    skip: offset,
                    orderBy: { categoria: 'asc' }
                })
            ]);

            return {
                data: categorias.map(categoria => CategoriaMapper.mapSimple(categoria)),
                total,
                page,
                perPage
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async registrar(categoria: CategoriaCrear, negocio_id: string): Promise<CategoriaSimple> {
        try {
            const nuevaCategoria = await this.prisma.categoriaProducto.create({
                data: {
                    ...categoria,
                    negocio_id,
                    activo: true,
                    default_categoria: false
                }
            });

            return CategoriaMapper.mapSimple(nuevaCategoria);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizar(id: string, categoria: CategoriaActualizar, negocio_id: string): Promise<CategoriaSimple> {
        try {
            const categoriaActualizada = await this.prisma.categoriaProducto.update({
                
                where: { id, activo: true, default_categoria: false, negocio_id},
                data: categoria
            });

            return CategoriaMapper.mapSimple(categoriaActualizada);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminar(id: string, negocio_id: string): Promise<void> {
        try {
            const categoriaActualizada = await this.prisma.categoriaProducto.updateMany(
                {
                    where: { id, negocio_id, activo: true, default_categoria: false },
                    data: {
                        activo: false
                    }
                }
            );

            if (categoriaActualizada.count === 0) {
                throw new NotFoundPersistenceError();
            }
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) {
                throw error;
            }
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtenerTodas(negocio_id: string): Promise<CategoriaSimple[]> {
        try {
            const categorias = await this.prisma.categoriaProducto.findMany({
                where: {
                    activo: true,
                    OR: [
                        { negocio_id },
                        { default_categoria: true }
                    ]
                },
                orderBy: { categoria: 'asc' }
            });

            return categorias.map(cat => CategoriaMapper.mapSimple(cat));
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtenerSubcategorias(categoria_padre_id: string, negocio_id: string): Promise<CategoriaSimple[]> {
        try {
            const subcategorias = await this.prisma.categoriaProducto.findMany({
                where: {
                    activo: true,
                    categoria_padre_id,
                    OR: [
                        { negocio_id },
                        { default_categoria: true }
                    ]
                },
                orderBy: { categoria: 'asc' }
            });

            return subcategorias.map(cat => CategoriaMapper.mapSimple(cat));
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
