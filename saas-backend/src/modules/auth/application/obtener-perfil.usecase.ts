import AppError from "@shared/errors/AppError.js";
import type { AuthRepository } from "../domain/auth.repository.js";
import type { UsuarioAutentificacion } from "../domain/auth-user.entity.js";


interface ObtenerPerfilRespuesta extends Pick<UsuarioAutentificacion, "id" | "nombre"  | "rol"  | "negocio_id"> { }

export class ObtenerPerfilUseCase {
    constructor(
        private authRepository: AuthRepository
    ) { }

    async execute(usuario_id: string): Promise<ObtenerPerfilRespuesta> {
        const usuario = await this.authRepository.buscarPorId(usuario_id)
        if (!usuario) {
            throw new AppError("Usuario no encontrado", "NOT_FOUND", 404)
        }
        return {
            id: usuario.id,
            nombre: usuario.nombre,
            rol: usuario.rol,
            negocio_id: usuario.negocio_id,
        }
    }
}