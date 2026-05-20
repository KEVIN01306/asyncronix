import { Prisma, type PrismaClient } from "@prisma/client";
import type { UsuarioRepository } from "../domain/usuario.repository.js";
import type { Usuario, UsuarioActualizar, UsuarioCrear, UsuarioObtenidoDetalle, UsuarioSimple, UsuarioActualizarPerfil } from "../domain/usuario.entity.js";
import { UsuarioMapper } from "./mappers/usuario.mapper.js";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";
import type { Paginated } from "@shared/domain/paginated.js";
import type { Pagination } from "@shared/domain/pagination.js";


export class PrismaUsuarioRepository implements UsuarioRepository {
    constructor(private readonly db: PrismaClient) { }

    async obtener(
        id: Usuario["id"],
        negocio_id: Usuario["negocio_id"]
    ): Promise<UsuarioObtenidoDetalle | null> {

        const usuario = await this.db.usuario.findFirst({
            where: { id, negocio_id, activo: true },
            include: { 
                negocio: { select: { id: true, nombre_comercial: true } },
                sucursal: { select: { id: true, nombre: true } },
                roles: {
                    select: {
                        id: true,
                        nombre: true,
                    }
                }
            }
        })

        if (!usuario) return null

        return UsuarioMapper.mapDetalle(usuario)
    }


    async obtenerPorTelefono(
        telefono: Usuario["telefono"],
    ): Promise<UsuarioObtenidoDetalle | null> {

        const usuario = await this.db.usuario.findFirst({
            where: { telefono, activo: true },
            include: { 
                negocio: { select: { id: true, nombre_comercial: true } },
                sucursal: { select: { id: true, nombre: true } },
                roles: {
                    select: {
                        id: true,
                        nombre: true,
                    }
                }
            }
        })

        if (!usuario) return null

        return UsuarioMapper.mapDetalle(usuario)

    }


    async listar(
        negocio_id: Usuario["negocio_id"],
        pagination: Pagination
    ): Promise<Paginated<UsuarioSimple>> {

        const { page, perPage } = pagination
        const offset = (page - 1) * perPage

        const where = { negocio_id, activo: true };

        const [total, usuarios] = await Promise.all([
            this.db.usuario.count({ where }),
            this.db.usuario.findMany({
                where,
                include: { 
                    negocio: { select: { id: true, nombre_comercial: true } },
                    sucursal: { select: { id: true, nombre: true } },
                    roles: {
                        select: {
                            id: true,
                            nombre: true,
                        }
                    }
                },
                take: perPage,
                skip: offset,
                orderBy: { nombre: 'asc' }
            })
        ])

        return {
            data: usuarios.map(usuario => (
                UsuarioMapper.mapSimple(usuario)
            )),
            total,
            page,
            perPage
        }

    }

    async registrar(data: UsuarioCrear, negocio_id: Usuario["negocio_id"]): Promise<UsuarioSimple> {
        try {

            const { rolIds, ...usuarioData } = data
            const usuario = await this.db.usuario.create({
                data: {
                    ...usuarioData,
                    negocio_id,
                    activo: true,
                    roles: {
                        connect: rolIds.map(id => ({ id })),
                    }
                },
                include: {
                    negocio: { select: { id: true, nombre_comercial: true } },
                    sucursal: { select: { id: true, nombre: true } },
                    roles: {
                        select: {
                            id: true,
                            nombre: true,
                            negocio_id: true,
                            permisos: {
                                select: {
                                    id: true,
                                    codigo: true
                                }
                            }
                        }
                    }
                }
            })

            return UsuarioMapper.mapSimple(usuario)
        } catch (error) {
            throw PrismaErrorMapper.map(error)
        }
    }

    async actualizar(id: Usuario["id"], negocio_id: Usuario["negocio_id"], data: UsuarioActualizar): Promise<UsuarioSimple> {
        try {
            const { rolIds, ...usuarioData } = data
            const usuario = await this.db.usuario.update({
                where: { id, negocio_id, activo: true },
                data: {
                    ...usuarioData,
                    roles: {
                        set: rolIds.map(id => ({ id })),
                    }
                },
                include: {
                    negocio: { select: { id: true, nombre_comercial: true } },
                    sucursal: { select: { id: true, nombre: true } },
                    roles: {
                        select: {
                            id: true,
                            nombre: true,
                            negocio_id: true,
                            permisos: {
                                select: {
                                    id: true,
                                    codigo: true
                                }
                            }
                        }
                    }
                }
            })

            return UsuarioMapper.mapSimple(usuario)
        } catch (error) {
            throw PrismaErrorMapper.map(error)
        }

    }

    async eliminar(id: Usuario["id"], negocio_id: Usuario["negocio_id"]): Promise<void> {
        try {
            await this.db.usuario.update({
                where: { id, negocio_id, activo: true },
                data: {
                    activo: false
                }
            })
        } catch (error) {
            throw PrismaErrorMapper.map(error)
        }
    }

    async actualizarPerfil(id: Usuario["id"], negocio_id: Usuario["negocio_id"], data: UsuarioActualizarPerfil): Promise<UsuarioSimple> {
        try {
            const usuario = await this.db.usuario.update({
                where: { id, negocio_id, activo: true },
                data,
                include: {
                    negocio: { select: { id: true, nombre_comercial: true } },
                    sucursal: { select: { id: true, nombre: true } },
                    roles: {
                        select: { id: true, nombre: true, negocio_id: true, permisos: { select: { id: true, codigo: true } } }
                    }
                }
            })
            return UsuarioMapper.mapSimple(usuario)
        } catch (error) {
            throw PrismaErrorMapper.map(error)
        }
    }

    async actualizarAvatar(id: Usuario["id"], negocio_id: Usuario["negocio_id"], avatar_url: string): Promise<void> {
        try {
            await this.db.usuario.update({
                where: { id, negocio_id, activo: true },
                data: { avatar_url }
            })
        } catch (error) {
            throw PrismaErrorMapper.map(error)
        }
    }

    async cambiarPassword(id: Usuario["id"], negocio_id: Usuario["negocio_id"], password_hash: string): Promise<void> {
        try {
            await this.db.usuario.update({
                where: { id, negocio_id, activo: true },
                data: { password_hash }
            })
        } catch (error) {
            throw PrismaErrorMapper.map(error)
        }
    }

}