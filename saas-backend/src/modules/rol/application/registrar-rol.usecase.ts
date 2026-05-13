import AppError from "@shared/errors/AppError.js";
import type { RolCrear, RolSimple } from "../domain/rol.entity.js";
import type { RolRepository } from "../domain/rol.repository.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import { InvalidPermissionError } from "@shared/database/errors/InvalidPermissionError.js";
import { UniqueConstraintError } from "@shared/database/errors/UniqueConstraintError.js";

export class RegistrarRolUseCase {
    constructor(private readonly rolRepository: RolRepository) { }

    async execute(data: RolCrear, negocio_id: string): Promise<RolSimple> {
        try {
            await this.rolRepository.validarPermisos(negocio_id, data.permisoIds)

            const rol = {
                ...data,
                activo: true
            }

            return await this.rolRepository.registrar(rol, negocio_id)
        } catch (error) {
            if (error instanceof InvalidPermissionError) {
                throw new AppError('Alguno de los permisos no pertenece al negocio', 'INVALID_PERMISSION', 400)
            }

            if (error instanceof UniqueConstraintError) {
                throw new AppError('El rol ya existe', 'DATA_ALREADY_EXISTS', 409)
            }

            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500)
            }

            throw error
        }
    }
}
