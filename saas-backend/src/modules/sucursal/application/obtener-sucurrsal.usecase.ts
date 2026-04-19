import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { SucursalObtenidoDetalle } from "../domain/sucursal.entity.js";
import type { SucursalRepository } from "../domain/sucursal.repository.js";

export class ObtenerSucursalUseCase {
    constructor(
        private readonly sucursalRepository: SucursalRepository
    ) { }

    async execute(id: string, negocio_id: string): Promise<SucursalObtenidoDetalle> {
        try {
            const sucursal = await this.sucursalRepository.obtener(id, negocio_id);

            if (!sucursal) {
                throw new AppError('No se encontró la sucursal', 'DATA_NOT_FOUND', 404);
            }

            return sucursal;
        } catch (error) {
            if (error instanceof AppError) throw error;

            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500)
            }

            throw error
        }
    }
}
