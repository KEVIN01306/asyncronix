import { Prisma, type PrismaClient } from "@prisma/client";
import type { UsuarioRepository } from "../domain/usuario.repository.js";
import type { Usuario, UsuarioActualizar, UsuarioCrear, UsuarioObtenidoDetalle, UsuarioSimple } from "../domain/usuario.entity.js";
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

        const usuario = await this.db.usuarios.findFirst({
            where: { id, negocio_id, activo: true },
            include: { negocios: { select: { id: true, nombre_comercial: true } }
            , sucursales: { select: { id: true, nombre: true } } 
            }
        })

        if (!usuario) return null

        return UsuarioMapper.mapDetalle(usuario)
    }


    async obtenerPorTelefono(
        telefono: Usuario["telefono"],
    ): Promise<UsuarioObtenidoDetalle | null> {

        const usuario = await this.db.usuarios.findFirst({
            where: { telefono, activo: true },
            include: { 
                negocios: { select: { id: true, nombre_comercial: true } },
                sucursales: { select: { id: true, nombre: true } }
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
            this.db.usuarios.count({ where }),
            this.db.usuarios.findMany({
                where,
                include: { negocios: { select: { id: true, nombre_comercial: true } },
                            sucursales: { select: { id: true, nombre: true } } },
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
            const usuario = await this.db.usuarios.create({
                data: {
                    ...data,
                    negocio_id,
                    rol: UsuarioMapper.mapRolBaseDatos(data.rol)
                }
            })

            return UsuarioMapper.mapSimple(usuario)
        } catch (error) {
            throw PrismaErrorMapper.map(error)
        }
    }

    async actualizar(id: Usuario["id"], negocio_id: Usuario["negocio_id"], data: UsuarioActualizar): Promise<UsuarioSimple> {
        try {
            const usuario = await this.db.usuarios.update({
                where: { id, negocio_id, activo: true },
                data: {
                    ...data,
                    rol: UsuarioMapper.mapRolBaseDatos(data.rol)
                }
            })

            return UsuarioMapper.mapSimple(usuario)
        } catch (error) {
            throw PrismaErrorMapper.map(error)
        }

    }

    async eliminar(id: Usuario["id"], negocio_id: Usuario["negocio_id"]): Promise<void> {
        try {
            await this.db.usuarios.update({
                where: { id, negocio_id, activo: true },
                data: {
                    activo: false
                }
            })
        } catch (error) {
            throw PrismaErrorMapper.map(error)
        }
    }

}