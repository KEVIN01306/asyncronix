import type { ChecklistItemActualizar, ChecklistItemCrear, ChecklistItemRepository } from "../domain/checklist-item.repository.js";
import type { ChecklistItemSimple } from "../domain/checklist-item.entity.js";
import type { PrismaClient } from "@prisma/client";

export class PrismaChecklistItemRepository implements ChecklistItemRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async listar(negocio_id: string, page: number, perPage: number) {
        const [data, total] = await Promise.all([
            this.prisma.checklistItem.findMany({
                where: { negocio_id },
                orderBy: { created_at: 'desc' },
                skip: (page - 1) * perPage,
                take: perPage,
            }),
            this.prisma.checklistItem.count({ where: { negocio_id } })
        ]);

        return { data, total };
    }

    async obtener(id: string, negocio_id: string) {
        const item = await this.prisma.checklistItem.findFirst({
            where: { id, negocio_id }
        });

        if (!item) {
            throw new Error('Checklist item no encontrado');
        }

        return item as ChecklistItemSimple;
    }

    async registrar(data: ChecklistItemCrear, negocio_id: string) {
        const item = await this.prisma.checklistItem.create({
            data: { ...data, negocio_id }
        });

        return item as ChecklistItemSimple;
    }

    async actualizar(id: string, negocio_id: string, data: ChecklistItemActualizar) {
        const updated = await this.prisma.checklistItem.updateMany({
            where: { id, negocio_id },
            data
        });

        if (updated.count === 0) {
            throw new Error('Checklist item no encontrado');
        }

        const item = await this.prisma.checklistItem.findFirst({ where: { id, negocio_id } });
        if (!item) {
            throw new Error('Checklist item no encontrado');
        }

        return item as ChecklistItemSimple;
    }

    async eliminar(id: string, negocio_id: string) {
        const deleted = await this.prisma.checklistItem.deleteMany({
            where: { id, negocio_id }
        });

        if (deleted.count === 0) {
            throw new Error('Checklist item no encontrado');
        }
    }
}
