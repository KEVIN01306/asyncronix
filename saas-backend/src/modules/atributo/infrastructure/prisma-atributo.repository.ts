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
            // Ensure the attribute belongs to the negocio
            const existing = await this.prisma.atributo.findFirst({ where: { id, negocio_id } });
            if (!existing) throw new Error('Atributo no encontrado');

            // Handle valores (array of strings) if provided in payload
            const anyPayload: any = payload as any;
            const data: any = {};
            if (typeof anyPayload.nombre !== 'undefined') data.nombre = anyPayload.nombre;
            if (typeof anyPayload.activo !== 'undefined') data.activo = anyPayload.activo;

            // If valores provided, reconcile: add new ones, remove omitted, keep existing
            if (Array.isArray(anyPayload.valores)) {
                const desiredValues: string[] = Array.from(new Set(anyPayload.valores.map((v: string) => String(v).trim()).filter(Boolean)));

                // load existing valores for this atributo
                const existingValores = await this.prisma.valorAtributo.findMany({ where: { atributo_id: existing.id } });
                const existingSet = new Set(existingValores.map(v => v.valor));
                const desiredSet = new Set(desiredValues);

                const toCreate = desiredValues.filter(v => !existingSet.has(v));
                const toDelete = existingValores.filter(v => !desiredSet.has(v.valor)).map(v => v.valor);

                // Prepare operations
                const ops: any[] = [];

                // Update atributo fields if any
                if (Object.keys(data).length > 0) {
                    ops.push(this.prisma.atributo.update({ where: { id: existing.id }, data: { nombre: data.nombre, activo: data.activo } }));
                }

                if (toCreate.length > 0) {
                    ops.push(this.prisma.valorAtributo.createMany({ data: toCreate.map(v => ({ atributo_id: existing.id, valor: v })), skipDuplicates: true }));
                }

                if (toDelete.length > 0) {
                    ops.push(this.prisma.valorAtributo.deleteMany({ where: { atributo_id: existing.id, valor: { in: toDelete } } }));
                }

                // Run in transaction
                await this.prisma.$transaction(ops);

                // Reload atributo with valores
                const updated = await this.prisma.atributo.findFirst({ where: { id: existing.id }, include: { valores: true } });
                if (!updated) throw new Error('Atributo no encontrado');
                return { id: updated.id, nombre: updated.nombre, activo: updated.activo, negocio_id: updated.negocio_id, valores: updated.valores.map(v => ({ id: v.id, valor: v.valor })) } as Atributo;
            }

            // No valores in payload: simple update
            if (Object.keys(data).length > 0) {
                const updated = await this.prisma.atributo.update({ where: { id: existing.id }, data, include: { valores: true } });
                return { id: updated.id, nombre: updated.nombre, activo: updated.activo, negocio_id: updated.negocio_id, valores: updated.valores.map(v => ({ id: v.id, valor: v.valor })) } as Atributo;
            }

            // If nothing to update, return existing
            const found = await this.prisma.atributo.findFirst({ where: { id: existing.id }, include: { valores: true } });
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
