import multer from 'multer';

const memoryStorage = multer.memoryStorage();

const fileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido'));
    }
};

const limits = { fileSize: 5 * 1024 * 1024 };

export class FileUploadMiddleware {
    /**
     * Sube un solo archivo
     * @param fieldName Nombre del campo en el FormData
     * @param _folder Carpeta de destino (ahora ignorada ya que usamos memoria, pero se mantiene para compatibilidad de firma)
     */
    static single(fieldName: string, _folder?: string) {
        return multer({
            storage: memoryStorage,
            fileFilter,
            limits
        }).single(fieldName);
    }

    /**
     * Sube múltiples archivos
     * @param fieldName Nombre del campo en el FormData
     * @param maxCount Máximo de archivos permitidos
     * @param _folder Carpeta de destino
     */
    static array(fieldName: string, maxCount: number, _folder?: string) {
        return multer({
            storage: memoryStorage,
            fileFilter,
            limits
        }).array(fieldName, maxCount);
    }
}
