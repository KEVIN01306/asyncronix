import type { IStorageProvider } from "../../../shared/domain/providers/storage.provider.js";
import type { MediaRepository } from "../domain/media.repository.js";
import type { NegocioRepository } from "../../negocio/domain/negocio.repository.js";

export class EliminarMediaUseCase {
    constructor(
        private readonly storageProvider: IStorageProvider,
        private readonly mediaRepository: MediaRepository,
        private readonly negocioRepository: NegocioRepository
    ) { }

    async execute(negocio_id: string, path: string): Promise<void> {
        const media = await this.mediaRepository.obtenerPorPath(path);
        
        await this.storageProvider.deleteFile(path);
        
        if (media) {
            await this.mediaRepository.eliminarPorPath(path);
            await this.negocioRepository.decrementarStorage(negocio_id, media.size_bytes);
        }
    }
}
