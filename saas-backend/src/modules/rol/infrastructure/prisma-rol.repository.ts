import { type PrismaClient } from "@prisma/client";
import type { RolRepository } from "../domain/rol.repository.js";
import type { Rol, RolActualizar, RolCrear, RolObtenidoDetalle, RolSimple } from "../domain/rol.entity.js";
import { RolMapper } from "./mappers/rol.mapper.js";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";
import { InvalidPermissionError } from "@shared/database/errors/InvalidPermissionError.js";
import { NotFoundPersistenceError } from "@shared/database/errors/NotFoundPersistenceError.js";
import type { Pagination } from "@shared/domain/pagination.js";
import type { Paginated } from "@shared/domain/paginated.js";

export class PrismaRolRepository implements RolRepository {
    constructor(private readonly db: PrismaClient) { }

    async obtener(id: Rol["id"], negocio_id: Rol["negocio_id"]): Promise<RolObtenidoDetalle | null> {
        const rol = await this.db.rol.findFirst({
            where: { id, negocio_id, activo: true },
            include: {
                permisos: {
                    select: { id: true, codigo: true }
                }
            }
        })

        if (!rol) return null

        return RolMapper.mapDetalle(rol)
    }

    async listar(negocio_id: Rol["negocio_id"], pagination: Pagination, q?: string): Promise<Paginated<RolSimple>> {
        const { page, perPage } = pagination
        const offset = (page - 1) * perPage

        const baseWhere: any = { negocio_id, activo: true }

        const where = q ? { ...baseWhere, nombre: { contains: q } } : baseWhere

        const [total, roles] = await Promise.all([
            this.db.rol.count({ where }),
            this.db.rol.findMany({
                where,
                include: {
                    permisos: {
                        select: { id: true, codigo: true }
                    }
                },
                take: perPage,
                skip: offset,
                orderBy: { nombre: 'asc' }
            })
        ])

        return {
            data: roles.map(rol => RolMapper.mapSimple(rol)),
            total,
            page,
            perPage
        }
    }

    async validarPermisos(negocio_id: Rol["negocio_id"], permisoIds: string[]): Promise<void> {
        if (permisoIds.length === 0) return

        const permisosValidos = await this.db.permiso.count({
            where: {
                id: { in: permisoIds },
                activo: true,
                negocios: { some: { id: negocio_id } }
            }
        })

        if (permisosValidos !== permisoIds.length) {
            throw new InvalidPermissionError()
        }
    }

    async registrar(data: RolCrear, negocio_id: Rol["negocio_id"]): Promise<RolSimple> {
        try {
            const rol = await this.db.rol.create({
                data: {
                    nombre: data.nombre,
                    descripcion: data.descripcion,
                    negocio_id,
                    activo: true,
                    permisos: {
                        connect: data.permisoIds.map(id => ({ id }))
                    }
                },
                include: {
                    permisos: {
                        select: { id: true, codigo: true }
                    }
                }
            })

            return RolMapper.mapSimple(rol)
        } catch (error) {
            throw PrismaErrorMapper.map(error)
        }
    }

    async actualizar(id: Rol["id"], negocio_id: Rol["negocio_id"], data: RolActualizar): Promise<RolSimple> {
        try {
            const rolExistente = await this.db.rol.findFirst({ where: { id, negocio_id, activo: true } })
            if (!rolExistente) {
                throw new NotFoundPersistenceError()
            }

            const rol = await this.db.rol.update({
                where: { id },
                data: {
                    nombre: data.nombre,
                    descripcion: data.descripcion,
                    permisos: {
                        set: data.permisoIds.map(id => ({ id }))
                    }
                },
                include: {
                    permisos: {
                        select: { id: true, codigo: true }
                    }
                }
            })

            return RolMapper.mapSimple(rol)
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) {
                throw error
            }
            throw PrismaErrorMapper.map(error)
        }
    }

    async eliminar(id: Rol["id"], negocio_id: Rol["negocio_id"]): Promise<void> {
        try {
            const rolExistente = await this.db.rol.findFirst({ where: { id, negocio_id, activo: true } })
            if (!rolExistente) {
                throw new NotFoundPersistenceError()
            }

            await this.db.rol.update({
                where: { id },
                data: { activo: false }
            })
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) {
                throw error
            }
            throw PrismaErrorMapper.map(error)
        }
    }
}
