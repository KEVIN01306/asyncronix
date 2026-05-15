import type { PrismaClient } from "@prisma/client";
import type { Categoria, CategoriaActualizar, CategoriaCrear, CategoriaSimple } from "../domain/categoria.entity.js";
import type { CategoriaRepository } from "../domain/categoria.repository.js";
import { CategoriaMapper } from "./mappers/categoria.mapper.js";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";
import type { Pagination } from "@shared/domain/pagination.js";
import type { Paginated } from "@shared/domain/paginated.js";

export class PrismaCategoriaRepository implements CategoriaRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async obtener(id: string, negocio_id: string): Promise<CategoriaSimple | null> {
        const categoria = await this.prisma.categoriaProducto.findFirst({
            where: { id, negocio_id }
        });

        if (!categoria) return null;

        return CategoriaMapper.mapSimple(categoria);
    }

    async listar(negocio_id: string, pagination: Pagination): Promise<Paginated<CategoriaSimple>> {
        const { page, perPage } = pagination;
        const offset = (page - 1) * perPage;

        const where = { negocio_id };

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
    }

    async registrar(categoria: CategoriaCrear, negocio_id: string): Promise<CategoriaSimple> {
        try {
            const nuevaCategoria = await this.prisma.categoriaProducto.create({
                data: {
                    ...categoria,
                    negocio_id,
                    activo: categoria.activo ?? true,
                    default_categoria: categoria.default_categoria ?? false
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
                where: { id },
                data: categoria
            });

            return CategoriaMapper.mapSimple(categoriaActualizada);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminar(id: string, negocio_id: string): Promise<void> {
        try {
            await this.prisma.categoriaProducto.delete({
                where: { id }
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
