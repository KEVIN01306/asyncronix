import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import { NotFoundPersistenceError } from "@shared/database/errors/NotFoundPersistenceError.js";
import { UniqueConstraintError } from "@shared/database/errors/UniqueConstraintError.js";
import type { ProveedorActualizar, ProveedorObtenidoDetalle } from "../domain/proveedor.entity.js";
import type { ProveedorRepository } from "../domain/proveedor.repository.js";

export class ActualizarProveedorUseCase {
    constructor(
        private readonly proveedorRepository: ProveedorRepository
    ) { }

    async execute(id: string, negocio_id: string, data: ProveedorActualizar): Promise<ProveedorObtenidoDetalle> {
        try {
            return await this.proveedorRepository.actualizar(id, negocio_id, data);
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) {
                throw new AppError('No se encontró el proveedor para actualizar', 'DATA_NOT_FOUND', 404)
            }

            if (error instanceof UniqueConstraintError) {
                throw new AppError('El nombre del proveedor ya está en uso', 'DATA_ALREADY_EXISTS', 409)
            }

            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500)
            }

            throw error
        }
    }
}
