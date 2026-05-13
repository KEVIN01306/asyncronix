import AppError from "@shared/errors/AppError.js";
import type { RolRepository } from "../domain/rol.repository.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import { NotFoundPersistenceError } from "@shared/database/errors/NotFoundPersistenceError.js";

export class EliminarRolUseCase {
    constructor(private readonly rolRepository: RolRepository) { }

    async execute(id: string, negocio_id: string): Promise<void> {
        try {
            await this.rolRepository.eliminar(id, negocio_id)
        } catch (error) {
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
