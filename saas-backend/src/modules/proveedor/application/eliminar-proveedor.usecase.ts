import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import { NotFoundPersistenceError } from "@shared/database/errors/NotFoundPersistenceError.js";
import type { ProveedorRepository } from "../domain/proveedor.repository.js";

export class EliminarProveedorUseCase {
    constructor(
        private readonly proveedorRepository: ProveedorRepository
    ) { }

    async execute(id: string, negocio_id: string): Promise<void> {
        try {
            await this.proveedorRepository.eliminar(id, negocio_id);
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) {
                throw new AppError('No se encontró el proveedor para eliminar', 'DATA_NOT_FOUND', 404)
            }

            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500)
            }

            throw error
        }
    }
}
