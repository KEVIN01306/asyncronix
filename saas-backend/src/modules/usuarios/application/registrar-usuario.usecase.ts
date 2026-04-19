import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import { UniqueConstraintError } from "@shared/database/errors/UniqueConstraintError.js";
import type { Usuario, UsuarioCrear, UsuarioSimple } from "../domain/usuario.entity.js";
import type { UsuarioRepository } from "../domain/usuario.repository.js";
import type { HashProvider } from "@shared/domain/hash.provider.js";


export class RegistrarUsuarioUseCase {
    constructor(
        private readonly usuarioRepository: UsuarioRepository,
        private readonly hashProvider: HashProvider
    ) { }

    async execute(data: UsuarioCrear, negocio_id: Usuario["negocio_id"]): Promise<UsuarioSimple> {
        try {

            const password_hash = await this.hashProvider.hash(String(data.password_hash));

            const usuario = {
                ...data,
                activo: true,
                password_hash,
                verificado: false
            }

            const usuarioNuevo = await this.usuarioRepository.registrar(usuario, negocio_id)

            return usuarioNuevo
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new AppError('El usuario ya existe', 'DATA_ALREADY_EXISTS', 409)
            }

            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500)
            }

            throw error
        }

    }
}   