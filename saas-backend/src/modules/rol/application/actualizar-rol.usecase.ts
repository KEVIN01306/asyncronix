import AppError from "@shared/errors/AppError.js";
import type { RolActualizar, RolSimple } from "../domain/rol.entity.js";
import type { RolRepository } from "../domain/rol.repository.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import { InvalidPermissionError } from "@shared/database/errors/InvalidPermissionError.js";
import { NotFoundPersistenceError } from "@shared/database/errors/NotFoundPersistenceError.js";

export class ActualizarRolUseCase {
    constructor(private readonly rolRepository: RolRepository) { }

    async execute(id: string, negocio_id: string, data: RolActualizar): Promise<RolSimple> {
        try {
            await this.rolRepository.validarPermisos(negocio_id, data.permisoIds)
            return await this.rolRepository.actualizar(id, negocio_id, data)
        } catch (error) {
            if (error instanceof InvalidPermissionError) {
                throw new AppError('Alguno de los permisos no pertenece al negocio', 'INVALID_PERMISSION', 400)
            }

            if (error instanceof NotFoundPersistenceError) {
                throw new AppError('El rol no existe', 'RECORD_NOT_FOUND', 404)
            }

            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500)
            }

            throw error
        }
    }
}
