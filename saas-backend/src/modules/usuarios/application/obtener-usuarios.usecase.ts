import type { UsuarioSimple } from "../domain/usuario.entity.js";
import type { UsuarioRepository } from "../domain/usuario.repository.js";


interface ObtenerUsuariosParams {
    negocio_id: string
    page: number
    perPage: number
}

interface ObtenerUsuariosRespuesta extends UsuarioSimple { }

export class ObtenerUsuariosUseCase {

    constructor(
        private readonly usuarioRepository: UsuarioRepository
    ) { }

    async execute({ negocio_id, page, perPage }: ObtenerUsuariosParams): Promise<{ total: number, usuarios: ObtenerUsuariosRespuesta[] }> {

        const { total, data } = await this.usuarioRepository.listar(negocio_id, { page, perPage })

        return {
            total, usuarios: data.map(usuario => ({
                id: usuario.id,
                nombre: usuario.nombre,
                telefono: usuario.telefono,
                rol: usuario.rol,
                sucursal: usuario.sucursal ? {
                    id: usuario.sucursal.id,
                    nombre: usuario.sucursal.nombre,
                } : null
            }))
        }
    }
}