import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import { NotFoundPersistenceError } from "@shared/database/errors/NotFoundPersistenceError.js";
import type { SucursalRepository } from "../domain/sucursal.repository.js";

export class EliminarSucursalUseCase {
    constructor(
        private readonly sucursalRepository: SucursalRepository
    ) { }

    async execute(id: string, negocio_id: string): Promise<void> {
        try {
            await this.sucursalRepository.eliminar(id, negocio_id);
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) {
                throw new AppError('No se encontró la sucursal para eliminar', 'DATA_NOT_FOUND', 404)
            }

            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500)
            }

            throw error
        }
    }
}
