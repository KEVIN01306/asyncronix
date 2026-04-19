import { DatabaseError } from "@shared/database/errors/DatabaseError.js"
import type { Usuario } from "../domain/usuario.entity.js"
import type { UsuarioRepository } from "../domain/usuario.repository.js"
import AppError from "@shared/errors/AppError.js"
import { NotFoundPersistenceError } from "@shared/database/errors/NotFoundPersistenceError.js"


export class EliminarUsuarioUseCase {
    constructor(private readonly usuarioRepository: UsuarioRepository) { }

    async execute(id: Usuario["id"], negocio_id: Usuario["negocio_id"]): Promise<void> {
        try {
            await this.usuarioRepository.eliminar(id, negocio_id)
        } catch (error) {

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