import AppError from "@shared/errors/AppError.js";
import type { UsuarioObtenidoDetalle } from "../domain/usuario.entity.js";
import type { UsuarioRepository } from "../domain/usuario.repository.js";


interface ObtenerUsuarioParams {
    id: string,
    negocio_id: string
}

interface ObtenerUsuarioRespuesta extends UsuarioObtenidoDetalle { }

export class ObtenerUsuarioUseCase {

    constructor(
        private readonly usuarioRepository: UsuarioRepository
    ) { }

    async execute({ id, negocio_id }: ObtenerUsuarioParams): Promise<ObtenerUsuarioRespuesta> {

        const usuario = await this.usuarioRepository.obtener(id, negocio_id)

        if (!usuario) throw new AppError('Usuario no encontrado', 'DATA_NOT_FOUND', 404)

        return {
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            avatar_url: usuario.avatar_url,
            email: usuario.email,
            telefono: usuario.telefono,
            roles: usuario.roles,
            verificado: usuario.verificado,
            sucursal: usuario.sucursal ? {
                id: usuario.sucursal.id,
                nombre: usuario.sucursal.nombre,
            } : null
        }
    }
}