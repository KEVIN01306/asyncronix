import type { PrismaClient } from "@prisma/client";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";
import type { Paginated } from "@shared/domain/paginated.js";
import type { SucursalActualizar, SucursalCrear, SucursalCrearPersistencia, SucursalMiDetalle, SucursalObtenidoDetalle, SucursalSimple } from "../domain/sucursal.entity.js";
import type { SucursalRepository } from "../domain/sucursal.repository.js";
import { SucursalMapper } from "./mappers/sucursal.mapper.js";
import { CuentaBancariaMapper } from "../../cuenta-bancaria/infrastructure/mappers/cuenta-bancaria.mapper.js";
import type { Pagination } from "@shared/domain/pagination.js";

export class PrismaSucursalRepository implements SucursalRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async contar(negocio_id: string): Promise<number> {
        try {
            return await this.prisma.sucursal.count({ where: { negocio_id } });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async registrar(data: SucursalCrearPersistencia, negocio_id: string): Promise<SucursalObtenidoDetalle> {
        try {
            const sucursal = await this.prisma.sucursal.create({
                data: {
                    ...data,
                    negocio_id,
                },
                include: { negocio: true },
            });

            return SucursalMapper.mapDetalle(sucursal);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizar(id: string, negocio_id: string, data: SucursalActualizar): Promise<SucursalObtenidoDetalle> {
        try {
            const sucursal = await this.prisma.sucursal.update({
                where: { id, negocio_id },
                data,
                include: { negocio: true },
            });

            return SucursalMapper.mapDetalle(sucursal);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminar(id: string, negocio_id: string): Promise<void> {
        try {
            await this.prisma.sucursal.delete({
                where: { id, negocio_id },
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtener(id: string, negocio_id: string): Promise<SucursalObtenidoDetalle | null> {
        try {
            const sucursal = await this.prisma.sucursal.findFirst({
                where: { id, negocio_id },
                include: { negocio: true },
            });

            if (!sucursal) {
                return null;
            }

            return SucursalMapper.mapDetalle(sucursal);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtenerMiSucursal(negocio_id: string, sucursal_id: string): Promise<SucursalMiDetalle | null> {
        try {
            const sucursal = await this.prisma.sucursal.findFirst({
                where: { id: sucursal_id, negocio_id },
                include: {
                    cajas: true,
                    cuentas_bancarias: {
                        include: {
                            cuenta_bancaria: {
                                include: {
                                    banco: true,
                                    moneda: true,
                                },
                            },
                        },
                    },
                    usuarios: {
                        select: {
                            id: true,
                        },
                    },
                },
            });

            if (!sucursal) {
                return null;
            }

            return {
                ...SucursalMapper.mapDetalle(sucursal as any),
                cajas: sucursal.cajas.map((caja) => ({
                    id: caja.id,
                    nombre: caja.nombre,
                    tipo: caja.tipo,
                    saldo: caja.saldo,
                    activo: caja.activo,
                    created_at: caja.created_at,
                    updated_at: caja.updated_at,
                })),
                cuentas_bancarias: sucursal.cuentas_bancarias.map((item) => ({
                    metodo_pago: item.metodo_pago,
                    cuenta_bancaria: CuentaBancariaMapper.mapSimple(item.cuenta_bancaria as any),
                })),
                usuarios_count: sucursal.usuarios?.length ?? 0,
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async asignarCuentaBancaria(
        negocio_id: string,
        sucursal_id: string,
        cuenta_bancaria_id: string,
        metodo_pago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO'
    ): Promise<SucursalMiDetalle | null> {
        try {
            const sucursal = await this.prisma.sucursal.findFirst({
                where: { id: sucursal_id, negocio_id },
            });

            if (!sucursal) {
                return null;
            }

            const cuentaBancaria = await this.prisma.cuentaBancaria.findFirst({
                where: { id: cuenta_bancaria_id, negocio_id },
            });

            if (!cuentaBancaria) {
                return null;
            }

            const existing = await this.prisma.sucursalCuentaBancaria.findUnique({
                where: {
                    sucursal_id_cuenta_bancaria_id_metodo_pago: {
                        sucursal_id,
                        cuenta_bancaria_id,
                        metodo_pago,
                    },
                },
            });

            if (!existing) {
                await this.prisma.sucursalCuentaBancaria.create({
                    data: {
                        sucursal_id,
                        cuenta_bancaria_id,
                        metodo_pago,
                    },
                });
            }

            return this.obtenerMiSucursal(negocio_id, sucursal_id);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async listar(negocio_id: string, pagination: Pagination, q?: string): Promise<Paginated<SucursalSimple>> {
        try {
            const { page, perPage } = pagination;
            const skip = (page - 1) * perPage;

            const baseWhere: any = { negocio_id }
            const where = q
                ? {
                    ...baseWhere,
                    OR: [
                        { nombre: { contains: q } },
                        { direccion: { contains: q } }
                    ]
                }
                : baseWhere

            const [total, sucursales] = await Promise.all([
                this.prisma.sucursal.count({ where }),
                this.prisma.sucursal.findMany({
                    where,
                    include: { negocio: true },
                    skip,
                    take: perPage,
                    orderBy: { nombre: 'asc' },
                }),
            ]);

            return {
                total,
                data: sucursales.map(s => SucursalMapper.mapSimple(s)),
                page,
                perPage,
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
