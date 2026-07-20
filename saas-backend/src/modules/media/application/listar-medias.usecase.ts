import type { MediaRepository } from "../domain/media.repository.js";
import type { MediaEntity } from "../domain/media.entity.js";

export class ListarMediasUseCase {
    constructor(private readonly mediaRepository: MediaRepository) { }

    async execute(negocio_id: string, page: number = 1, perPage: number = 10): Promise<{ total: number, data: MediaEntity[] }> {
        return await this.mediaRepository.listar(negocio_id, page, perPage);
    }
}
