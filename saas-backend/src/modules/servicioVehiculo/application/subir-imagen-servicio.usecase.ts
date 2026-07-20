import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { ServicioRepository } from "../domain/servicio.repository.js";
import type { ServicioDetalle } from "../domain/servicio.entity.js";
import type { IStorageProvider, FileDTO } from "@shared/domain/providers/storage.provider.js";

interface Params {
    servicio_id: string;
    file: FileDTO;
    negocio_id: string;
    descripcion?: string | null;
}

export class SubirImagenServicioUseCase {
    constructor(
        private readonly repository: ServicioRepository,
        private readonly storageProvider: IStorageProvider
    ) { }

    async execute({ servicio_id, file, negocio_id, descripcion }: Params): Promise<ServicioDetalle> {
        try {
            const path = `tenant_${negocio_id}/services/vehiculo/srv_${servicio_id}`;
            const url = await this.storageProvider.uploadFile(file, path);
            
            const servicio = await this.repository.registrarImagen(servicio_id, url, negocio_id, descripcion);
            if (!servicio) throw new AppError('Servicio no encontrado', 'DATA_NOT_FOUND', 404);
            return servicio;
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
