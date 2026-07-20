import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import { UniqueConstraintError } from "@shared/database/errors/UniqueConstraintError.js";
import type { NegocioCrear, NegocioObtenidoDetalle } from "../domain/negocio.entity.js";
import type { NegocioRepository } from "../domain/negocio.repository.js";
import type { IStorageProvider, FileDTO } from "@shared/domain/providers/storage.provider.js";
import { v4 as uuidv4 } from "uuid";

export class RegistrarNegocioUseCase {
    constructor(
        private readonly negocioRepository: NegocioRepository,
        private readonly storageProvider: IStorageProvider
    ) { }

    async execute(data: NegocioCrear, logoFile: FileDTO | null | undefined): Promise<NegocioObtenidoDetalle> {
        try {
            const negocioExistente = await this.negocioRepository.obtenerPorWaId(data.wa_id);
            if (negocioExistente) {
                throw new AppError('El negocio ya existe', 'DATA_ALREADY_EXISTS', 409);
            }

            const slug = data.nombre_comercial.toLowerCase().replace(/\s+/g, '-');
            const nuevoNegocio = await this.negocioRepository.registrar({
                ...data,
                slug,
                logo_url: null
            });
            
            if (logoFile) {
                const path = `tenant_${nuevoNegocio.id}/business/bus_${nuevoNegocio.id}`;
                const logo_url = await this.storageProvider.uploadFile(logoFile, path, 'logo');
                await this.negocioRepository.actualizar(nuevoNegocio.id, { logo_url });
                nuevoNegocio.logo_url = logo_url;
            }

            return nuevoNegocio;
        } catch (error) {

            if (error instanceof AppError) throw error;

            if (error instanceof UniqueConstraintError) {
                throw new AppError('El identificador del negocio ya existe', 'DATA_ALREADY_EXISTS', 409)
            }

            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500)
            }

            throw error
        }
    }
}
