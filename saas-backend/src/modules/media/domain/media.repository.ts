import type { MediaEntity } from "./media.entity.js";

export interface MediaRepository {
    crear(data: Omit<MediaEntity, "id" | "created_at">): Promise<MediaEntity>;
    obtenerPorPath(path: string): Promise<MediaEntity | null>;
    eliminarPorPath(path: string): Promise<void>;
    listar(negocio_id: string, page: number, perPage: number): Promise<{ total: number, data: MediaEntity[] }>;
}
