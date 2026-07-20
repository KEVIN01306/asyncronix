import type { PrismaClient } from "@prisma/client";
import { PrismaErrorMapper } from "../../../shared/database/prisma/PrismaErrorMapper.js";
import type { MediaEntity } from "../domain/media.entity.js";
import type { MediaRepository } from "../domain/media.repository.js";

export class PrismaMediaRepository implements MediaRepository {

    constructor(private readonly prisma: PrismaClient) { }

    async crear(data: Omit<MediaEntity, "id" | "created_at">): Promise<MediaEntity> {
        try {
            return await this.prisma.media.create({
                data: {
                    negocio_id: data.negocio_id,
                    path: data.path,
                    size_bytes: data.size_bytes,
                    mime_type: data.mime_type
                }
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtenerPorPath(path: string): Promise<MediaEntity | null> {
        try {
            return await this.prisma.media.findFirst({
                where: { path }
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminarPorPath(path: string): Promise<void> {
        try {
            await this.prisma.media.deleteMany({
                where: { path }
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async listar(negocio_id: string, page: number, perPage: number): Promise<{ total: number, data: MediaEntity[] }> {
        try {
            const skip = (page - 1) * perPage;
            const [total, data] = await Promise.all([
                this.prisma.media.count({ where: { negocio_id } }),
                this.prisma.media.findMany({
                    where: { negocio_id },
                    skip,
                    take: perPage,
                    orderBy: { created_at: 'desc' }
                })
            ]);
            return { total, data };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
