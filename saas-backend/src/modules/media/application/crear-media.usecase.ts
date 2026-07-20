import type { IStorageProvider, FileDTO } from "../../../shared/domain/providers/storage.provider.js";
import type { MediaRepository } from "../domain/media.repository.js";
import type { NegocioRepository } from "../../negocio/domain/negocio.repository.js";
import type { MediaEntity } from "../domain/media.entity.js";

export class CrearMediaUseCase {
    constructor(
        private readonly storageProvider: IStorageProvider,
        private readonly mediaRepository: MediaRepository,
        private readonly negocioRepository: NegocioRepository
    ) { }

    async execute(file: FileDTO, negocio_id: string, path: string, fixedFileName?: string): Promise<string> {
        // Subir a Storage
        const finalPath = await this.storageProvider.uploadFile(file, path, fixedFileName);

        // Si se especificó fixedFileName, podría ser un reemplazo implícito de un archivo anterior.
        // Pero como estamos subiendo, vamos a registrar la media.
        // Lo correcto sería usar ReemplazarMediaUseCase para manejar bien el delta, 
        // pero para avatares y logos, usaremos reemplazarMediaUseCase.
        // Aquí asumimos subida simple de imagen que no reemplaza.

        await this.mediaRepository.crear({
            negocio_id,
            path: finalPath,
            size_bytes: file.size,
            mime_type: file.mimetype
        });

        // Incrementar almacenamiento
        await this.negocioRepository.incrementarStorage(negocio_id, file.size);

        return finalPath;
    }
}
