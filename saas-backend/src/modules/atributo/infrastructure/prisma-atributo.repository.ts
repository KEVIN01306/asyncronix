import type { PrismaClient } from '@prisma/client';
import type { Atributo, AtributoCrear, AtributoActualizar, ValorAtributoSimple, ValorAtributoCrear, ValorAtributoActualizar } from '../domain/atributo.entity.js';
import { PrismaErrorMapper } from '@shared/database/prisma/PrismaErrorMapper.js';

export class PrismaAtributoRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async listar(negocio_id: string): Promise<Atributo[]> {
        try {
            const list = await this.prisma.atributo.findMany({ where: { negocio_id, activo: true }, include: { valores: true } });
            return list.map(a => ({ id: a.id, nombre: a.nombre, activo: a.activo, negocio_id: a.negocio_id, valores: a.valores.map(v => ({ id: v.id, valor: v.valor })) } as Atributo));
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtener(id: string, negocio_id: string): Promise<Atributo | null> {
        try {
            const found = await this.prisma.atributo.findFirst({ where: { id, negocio_id }, include: { valores: true } });
            if (!found) return null;
            return { id: found.id, nombre: found.nombre, activo: found.activo, negocio_id: found.negocio_id, valores: found.valores.map(v => ({ id: v.id, valor: v.valor })) } as Atributo;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async crear(payload: AtributoCrear, negocio_id: string): Promise<Atributo> {
        try {
            const created = await this.prisma.atributo.create({ data: { nombre: payload.nombre, negocio_id, activo: true, valores: payload.valores ? { create: payload.valores.map(v => ({ valor: v })) } : undefined }, include: { valores: true } });
            return { id: created.id, nombre: created.nombre, activo: created.activo, negocio_id: created.negocio_id, valores: created.valores.map(v => ({ id: v.id, valor: v.valor })) } as Atributo;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizar(id: string, payload: AtributoActualizar, negocio_id: string): Promise<Atributo> {
        try {
            const updated = await this.prisma.atributo.updateMany({ where: { id, negocio_id }, data: payload });
            if (updated.count === 0) throw new Error('Atributo no encontrado');
            const found = await this.prisma.atributo.findFirst({ where: { id, negocio_id }, include: { valores: true } });
            if (!found) throw new Error('Atributo no encontrado');
            return { id: found.id, nombre: found.nombre, activo: found.activo, negocio_id: found.negocio_id, valores: found.valores.map(v => ({ id: v.id, valor: v.valor })) } as Atributo;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminar(id: string, negocio_id: string): Promise<void> {
        try {
            const result = await this.prisma.atributo.updateMany({ where: { id, negocio_id }, data: { activo: false } });
            if (result.count === 0) throw new Error('Atributo no encontrado');
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    // Valores
    async crearValor(payload: ValorAtributoCrear): Promise<ValorAtributoSimple> {
        try {
            const created = await this.prisma.valorAtributo.create({ data: { atributo_id: payload.atributo_id, valor: payload.valor } });
            return { id: created.id, valor: created.valor };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizarValor(id: string, payload: ValorAtributoActualizar): Promise<ValorAtributoSimple> {
        try {
            const updated = await this.prisma.valorAtributo.update({ where: { id }, data: payload });
            return { id: updated.id, valor: updated.valor };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminarValor(id: string): Promise<void> {
        try {
            await this.prisma.valorAtributo.delete({ where: { id } });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}

export default PrismaAtributoRepository;
