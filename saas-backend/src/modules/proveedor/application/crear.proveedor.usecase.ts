import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import { UniqueConstraintError } from "@shared/database/errors/UniqueConstraintError.js";
import type { ProveedorCrear, ProveedorObtenidoDetalle } from "../domain/proveedor.entity.js";
import type { ProveedorRepository } from "../domain/proveedor.repository.js";

export class RegistrarProveedorUseCase {
    constructor(
        private readonly proveedorRepository: ProveedorRepository
    ) { }

    async execute(data: ProveedorCrear, negocio_id: string): Promise<ProveedorObtenidoDetalle> {
        try {
            return await this.proveedorRepository.registrar(data, negocio_id);
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new AppError('El proveedor ya existe en este negocio', 'DATA_ALREADY_EXISTS', 409)
            }

            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500)
            }

            throw error
        }
    }
}
