import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { Usuario } from "../domain/usuario.entity.js";
import type { UsuarioRepository } from "../domain/usuario.repository.js";

export class ActualizarAvatarUseCase {
    constructor(private readonly usuarioRepository: UsuarioRepository) { }

    async execute(id: Usuario["id"], negocio_id: Usuario["negocio_id"], avatar_url: string): Promise<void> {
        try {
            await this.usuarioRepository.actualizarAvatar(id, negocio_id, avatar_url);
        } catch (error) {

            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            }

            throw error;
        }
    }
}
