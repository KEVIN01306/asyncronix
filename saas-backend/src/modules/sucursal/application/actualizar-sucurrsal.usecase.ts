import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import { NotFoundPersistenceError } from "@shared/database/errors/NotFoundPersistenceError.js";
import { UniqueConstraintError } from "@shared/database/errors/UniqueConstraintError.js";
import type { SucursalActualizar, SucursalObtenidoDetalle } from "../domain/sucursal.entity.js";
import type { SucursalRepository } from "../domain/sucursal.repository.js";

export class ActualizarSucursalUseCase {
    constructor(
        private readonly sucursalRepository: SucursalRepository
    ) { }

    async execute(id: string, negocio_id: string, data: SucursalActualizar): Promise<SucursalObtenidoDetalle> {
        try {
            return await this.sucursalRepository.actualizar(id, negocio_id, data);
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) {
                throw new AppError('No se encontró la sucursal para actualizar', 'DATA_NOT_FOUND', 404)
            }

            if (error instanceof UniqueConstraintError) {
                throw new AppError('El nombre de la sucursal ya está en uso', 'DATA_ALREADY_EXISTS', 409)
            }

            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500)
            }

            throw error
        }
    }
}
