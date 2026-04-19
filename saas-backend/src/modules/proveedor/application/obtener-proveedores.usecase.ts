import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { Paginated } from "@shared/domain/paginated.js";
import type { ProveedorSimple } from "../domain/proveedor.entity.js";
import type { ProveedorRepository } from "../domain/proveedor.repository.js";

export class ObtenerProveedoresUseCase {
    constructor(
        private readonly proveedorRepository: ProveedorRepository
    ) { }

    async execute(params: { negocio_id: string; page: number; perPage: number }): Promise<Paginated<ProveedorSimple>> {
        try {
            return await this.proveedorRepository.listar(params);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500)
            }

            throw error
        }
    }
}
