import AppError from "@shared/errors/AppError.js";
import type { Permiso } from "../domain/permiso.entity.js";
import type { PermisosRepository } from "../domain/permisos.repository.js";
import { InvalidPermissionError } from "@shared/database/errors/InvalidPermissionError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import { NotFoundPersistenceError } from "@shared/database/errors/NotFoundPersistenceError.js";

export class AsignarPermisosRolUseCase {
    constructor(private readonly permisosRepository: PermisosRepository) { }

    async execute(rol_id: string, negocio_id: string, permisoIds: string[]): Promise<Permiso[]> {
        try {
            return await this.permisosRepository.asignarPermisosRol(rol_id, negocio_id, permisoIds);
        } catch (error) {
            if (error instanceof InvalidPermissionError) {
                throw new AppError('Alguno de los permisos no pertenece al negocio', 'INVALID_PERMISSION', 400);
            }

            if (error instanceof NotFoundPersistenceError) {
                throw new AppError('El rol no existe', 'RECORD_NOT_FOUND', 404);
            }

            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            }

            throw error;
        }
    }
}
