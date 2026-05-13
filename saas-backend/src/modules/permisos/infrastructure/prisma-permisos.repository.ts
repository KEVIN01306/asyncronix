import { type PrismaClient } from "@prisma/client";
import type { Modulo, Permiso } from "../domain/permiso.entity.js";
import type { PermisosRepository } from "../domain/permisos.repository.js";
import { PermisosMapper } from "./mappers/permisos.mapper.js";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";
import { InvalidPermissionError } from "@shared/database/errors/InvalidPermissionError.js";
import { NotFoundPersistenceError } from "@shared/database/errors/NotFoundPersistenceError.js";
import type { Pagination } from "@shared/domain/pagination.js";
import type { Paginated } from "@shared/domain/paginated.js";

export class PrismaPermisosRepository implements PermisosRepository {
    constructor(private readonly db: PrismaClient) { }

    async listarModulos(negocio_id: string, pagination?: Pagination): Promise<Paginated<Modulo>> {
        const page = pagination?.page ?? 1;
        const perPage = pagination?.perPage ?? 1000;
        const offset = (page - 1) * perPage;

        const where = {
            activo: true,
            negocios: { some: { id: negocio_id } }
        };

        const [total, modulos] = await Promise.all([
            this.db.modulo.count({ where }),
            this.db.modulo.findMany({
                where,
                take: perPage,
                skip: offset,
                orderBy: { nombre: 'asc' }
            })
        ]);

        return {
            data: modulos.map(PermisosMapper.mapModulo),
            total,
            page,
            perPage
        };
    }

    async listarPermisos(negocio_id: string, modulo_id?: string, pagination?: Pagination): Promise<Paginated<Permiso>> {
        const page = pagination?.page ?? 1;
        const perPage = pagination?.perPage ?? 1000;
        const offset = (page - 1) * perPage;

        const where: any = {
            activo: true,
            negocios: { some: { id: negocio_id } }
        };

        if (modulo_id) {
            where.modulo_id = modulo_id;
        }

        const [total, permisos] = await Promise.all([
            this.db.permiso.count({ where }),
            this.db.permiso.findMany({
                where,
                take: perPage,
                skip: offset,
                orderBy: { codigo: 'asc' }
            })
        ]);

        return {
            data: permisos.map(PermisosMapper.mapPermiso),
            total,
            page,
            perPage
        };
    }

    async obtenerPermisosRol(rol_id: string, negocio_id: string): Promise<Permiso[]> {
        const rol = await this.db.rol.findFirst({
            where: { id: rol_id, negocio_id, activo: true },
            include: {
                permisos: {
                    select: { id: true, codigo: true, descripcion: true, modulo_id: true }
                }
            }
        });

        if (!rol) {
            throw new NotFoundPersistenceError();
        }

        return rol.permisos.map(PermisosMapper.mapPermiso);
    }

    async asignarPermisosRol(rol_id: string, negocio_id: string, permisoIds: string[]): Promise<Permiso[]> {
        const rol = await this.db.rol.findFirst({ where: { id: rol_id, negocio_id, activo: true } });
        if (!rol) {
            throw new NotFoundPersistenceError();
        }

        if (permisoIds.length > 0) {
            const permisosValidos = await this.db.permiso.count({
                where: {
                    id: { in: permisoIds },
                    activo: true,
                    negocios: { some: { id: negocio_id } }
                }
            });

            if (permisosValidos !== permisoIds.length) {
                throw new InvalidPermissionError();
            }
        }

        try {
            const rolActualizado = await this.db.rol.update({
                where: { id: rol_id },
                data: {
                    permisos: {
                        set: permisoIds.map((id) => ({ id }))
                    }
                },
                include: {
                    permisos: {
                        select: { id: true, codigo: true, descripcion: true, modulo_id: true }
                    }
                }
            });

            return rolActualizado.permisos.map(PermisosMapper.mapPermiso);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
