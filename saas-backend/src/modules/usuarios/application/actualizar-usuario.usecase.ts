import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import { UniqueConstraintError } from "@shared/database/errors/UniqueConstraintError.js";
import AppError from "@shared/errors/AppError.js";
import type { Usuario, UsuarioActualizar, UsuarioSimple } from "../domain/usuario.entity.js";
import type { UsuarioRepository } from "../domain/usuario.repository.js";
import { NotFoundPersistenceError } from "@shared/database/errors/NotFoundPersistenceError.js";


export class ActualizarUsuarioUseCase {
    constructor(
        private readonly usuarioRepository: UsuarioRepository
    ) { }

    async execute(id: Usuario["id"], negocio_id: Usuario["negocio_id"], data: UsuarioActualizar): Promise<UsuarioSimple> {
        try {
            const usuarioActualizado = await this.usuarioRepository.actualizar(id, negocio_id, data)
            return usuarioActualizado
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new AppError('El usuario ya existe', 'DATA_ALREADY_EXISTS', 409)
            }

            if (error instanceof NotFoundPersistenceError) {
                throw new AppError('El usuario no existe', 'RECORD_NOT_FOUND', 404)
            }

            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500)
            }

            throw error
        }
    }
}