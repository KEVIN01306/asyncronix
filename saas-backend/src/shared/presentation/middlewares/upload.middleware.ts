import multer from 'multer';
import { storageConfig } from '../../infrastructure/storage/multer.config.js';

export class FileUploadMiddleware {
    /**
     * Sube un solo archivo
     * @param fieldName Nombre del campo en el FormData
     * @param folder Carpeta de destino (ej: 'avatars', 'products')
     */
    static single(fieldName: string, folder: string) {
        return multer({
            storage: storageConfig.getStorage(folder),
            fileFilter: storageConfig.fileFilter,
            limits: storageConfig.limits
        }).single(fieldName);
    }

    /**
     * Sube múltiples archivos
     * @param fieldName Nombre del campo en el FormData
     * @param maxCount Máximo de archivos permitidos
     * @param folder Carpeta de destino
     */
    static array(fieldName: string, maxCount: number, folder: string) {
        return multer({
            storage: storageConfig.getStorage(folder),
            fileFilter: storageConfig.fileFilter,
            limits: storageConfig.limits
        }).array(fieldName, maxCount);
    }
}
