import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { Usuario } from "../domain/usuario.entity.js";
import type { UsuarioRepository } from "../domain/usuario.repository.js";
import type { HashProvider } from "@shared/domain/hash.provider.js";

export class CambiarPasswordUseCase {
    constructor(
        private readonly usuarioRepository: UsuarioRepository,
        private readonly hashProvider: HashProvider
    ) { }

    async execute(id: Usuario["id"], negocio_id: Usuario["negocio_id"], password_plain: string): Promise<void> {
        try {
            const password_hash = await this.hashProvider.hash(password_plain);
            await this.usuarioRepository.cambiarPassword(id, negocio_id, password_hash);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos al cambiar contraseña', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
