import multer from 'multer';
import path from 'path';
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import type { Request } from 'express';


export const storageConfig = {

    getStorage: (subCarpeta: string) => multer.diskStorage({
        destination: (_req: Request, _file: Express.Multer.File, cb: any) => {
            const rutaCargada = path.join('uploads', subCarpeta);
            if (!fs.existsSync(rutaCargada)) {
                fs.mkdirSync(rutaCargada, { recursive: true })
            }
            cb(null, rutaCargada)
        },
        filename: (_req: Request, file: Express.Multer.File, cb: any) => {
            const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
            cb(null, fileName);
        }
    }),

    fileFilter: (_req: Request, file: Express.Multer.File, cb: any) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido'));
        }
    },

    limits: { fileSize: 5 * 1024 * 1024 }
}