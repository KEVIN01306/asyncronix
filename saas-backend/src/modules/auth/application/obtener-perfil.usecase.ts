import AppError from "@shared/errors/AppError.js";
import type { AuthRepository } from "../domain/auth.repository.js";
import type { UsuarioAutentificacion } from "../domain/auth-user.entity.js";


interface ObtenerPerfilRespuesta extends Pick<UsuarioAutentificacion, "id" | "nombre"  | "apellido" | "email" | "telefono" | "avatar_url" | "roles"  | "negocio_id" | "permisos" | "negocio" | "sucursal_id" | "verificado"> { }

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
            apellido: usuario.apellido,
            email: usuario.email,
            telefono: usuario.telefono,
            verificado: usuario.verificado,
            avatar_url: usuario.avatar_url,
            roles: usuario.roles,
            permisos: usuario.permisos,
            sucursal_id: usuario.sucursal_id,
            negocio_id: usuario.negocio_id,
            negocio: usuario.negocio ? {
                    id: usuario.negocio.id,
                    nombre_comercial: usuario.negocio.nombre_comercial,
                    logo_url: usuario.negocio.logo_url,
                    pais: usuario.negocio.pais ? {
                        id: usuario.negocio.pais.id,
                        codigo_iso: usuario.negocio.pais.codigo_iso,
                        nombre: usuario.negocio.pais.nombre,
                        codigo_tel: usuario.negocio.pais.codigo_tel,
                        moneda_id: usuario.negocio.pais.moneda_id,
                        locale: usuario.negocio.pais.locale ?? null,
                        activo: usuario.negocio.pais.activo,
                        created_at: usuario.negocio.pais.created_at,
                        updated_at: usuario.negocio.pais.updated_at,
                    } : null,
                    moneda: usuario.negocio.moneda ? {
                        id: usuario.negocio.moneda.id,
                        codigo: usuario.negocio.moneda.codigo,
                        nombre: usuario.negocio.moneda.nombre,
                        simbolo: usuario.negocio.moneda.simbolo,
                        activo: usuario.negocio.moneda.activo,
                        created_at: usuario.negocio.moneda.created_at,
                        updated_at: usuario.negocio.moneda.updated_at,
                    } : null,
                } : null
        }
    }
}