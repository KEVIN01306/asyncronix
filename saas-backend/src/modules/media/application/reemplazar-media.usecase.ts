import type { IStorageProvider, FileDTO } from "../../../shared/domain/providers/storage.provider.js";
import type { MediaRepository } from "../domain/media.repository.js";
import type { NegocioRepository } from "../../negocio/domain/negocio.repository.js";
import AppError from "../../../shared/errors/AppError.js";

export class ReemplazarMediaUseCase {
    constructor(
        private readonly storageProvider: IStorageProvider,
        private readonly mediaRepository: MediaRepository,
        private readonly negocioRepository: NegocioRepository
    ) { }

    async execute(file: FileDTO, negocio_id: string, path: string, fixedFileName?: string, oldUrl?: string): Promise<string> {
        // Calcular el tamaño anterior si conocemos el oldUrl para ajustar el check de límites
        let oldMediaSize = 0;
        if (oldUrl) {
            const oldMedia = await this.mediaRepository.obtenerPorPath(oldUrl);
            if (oldMedia) oldMediaSize = oldMedia.size_bytes;
        }

        const limites = await this.negocioRepository.obtenerLimites(negocio_id);
        if (limites && limites.storage_max_bytes !== null && limites.storage_max_bytes !== BigInt(-1)) {
            const used = limites.storage_bytes_used || BigInt(0);
            const newTotal = used - BigInt(oldMediaSize) + BigInt(file.size);
            if (newTotal > limites.storage_max_bytes) {
                throw new AppError('El límite de almacenamiento ha sido alcanzado. Extiende tu plan para poder subir más imágenes.', 'STORAGE_LIMIT_REACHED', 400);
            }
        }

        // En Cloudflare R2, si subimos al mismo path + fixedFileName se sobrescribe automáticamente.
        // Lo que importa es ajustar los tamaños en NegocioLimite.
        let finalPath = "";
        
        // Si hay un oldUrl explícito y queremos usar el método de reemplazar (que podría hacer borrado y subida)
        if (oldUrl) {
             const oldMedia = await this.mediaRepository.obtenerPorPath(oldUrl);
             if (oldMedia) {
                 await this.mediaRepository.eliminarPorPath(oldUrl);
                 await this.negocioRepository.decrementarStorage(negocio_id, oldMedia.size_bytes);
             }
             if (this.storageProvider.replaceFile) {
                 finalPath = await this.storageProvider.replaceFile(oldUrl, file, path, fixedFileName);
             } else {
                 await this.storageProvider.deleteFile(oldUrl);
                 finalPath = await this.storageProvider.uploadFile(file, path, fixedFileName);
             }
        } else {
             // Es posible que solo se suba y machaque en el bucket
             finalPath = await this.storageProvider.uploadFile(file, path, fixedFileName);
             const oldMedia = await this.mediaRepository.obtenerPorPath(finalPath);
             if (oldMedia) {
                 await this.mediaRepository.eliminarPorPath(finalPath);
                 await this.negocioRepository.decrementarStorage(negocio_id, oldMedia.size_bytes);
             }
        }

        await this.mediaRepository.crear({
            negocio_id,
            path: finalPath,
            size_bytes: file.size,
            mime_type: file.mimetype
        });
        await this.negocioRepository.incrementarStorage(negocio_id, file.size);

        return finalPath;
    }
}
