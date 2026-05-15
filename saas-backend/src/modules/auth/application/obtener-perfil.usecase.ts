import AppError from "@shared/errors/AppError.js";
import type { AuthRepository } from "../domain/auth.repository.js";
import type { UsuarioAutentificacion } from "../domain/auth-user.entity.js";


interface ObtenerPerfilRespuesta extends Pick<UsuarioAutentificacion, "id" | "nombre"  | "roles"  | "negocio_id" | "permisos" | "negocio"> { }

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
            roles: usuario.roles,
            permisos: usuario.permisos,
            negocio_id: usuario.negocio_id,
            negocio: usuario.negocio ? {
                    id: usuario.negocio.id,
                    nombre_comercial: usuario.negocio.nombre_comercial,
                    logo_url: usuario.negocio.logo_url
                } : null
        }
    }
}