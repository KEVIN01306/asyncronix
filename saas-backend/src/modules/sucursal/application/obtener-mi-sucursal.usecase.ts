import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { SucursalMiDetalle } from "../domain/sucursal.entity.js";
import type { SucursalRepository } from "../domain/sucursal.repository.js";

export class ObtenerMiSucursalUseCase {
    constructor(
        private readonly sucursalRepository: SucursalRepository
    ) { }

    async execute(negocio_id: string, sucursal_id: string): Promise<SucursalMiDetalle> {
        try {
            const sucursal = await this.sucursalRepository.obtenerMiSucursal(negocio_id, sucursal_id);

            if (!sucursal) {
                throw new AppError('No se encontró la sucursal', 'DATA_NOT_FOUND', 404);
            }

            return sucursal;
        } catch (error) {
            if (error instanceof AppError) throw error;

            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            }

            throw error;
        }
    }
}
