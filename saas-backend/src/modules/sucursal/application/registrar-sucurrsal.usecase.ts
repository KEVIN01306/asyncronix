import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import { UniqueConstraintError } from "@shared/database/errors/UniqueConstraintError.js";
import type { SucursalCrear, SucursalObtenidoDetalle } from "../domain/sucursal.entity.js";
import type { SucursalRepository } from "../domain/sucursal.repository.js";

export class RegistrarSucursalUseCase {
    constructor(
        private readonly sucursalRepository: SucursalRepository
    ) { }

    async execute(data: SucursalCrear, negocio_id: string): Promise<SucursalObtenidoDetalle> {
        try {
            const totalSucursales = await this.sucursalRepository.contar(negocio_id);

            return await this.sucursalRepository.registrar({
                ...data,
                es_principal: totalSucursales === 0
            }, negocio_id);
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new AppError('La sucursal ya existe en este negocio', 'DATA_ALREADY_EXISTS', 409)
            }

            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500)
            }

            throw error
        }
    }
}
