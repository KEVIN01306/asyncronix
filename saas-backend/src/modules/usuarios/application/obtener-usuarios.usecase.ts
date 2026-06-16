import type { UsuarioSimple } from "../domain/usuario.entity.js";
import type { UsuarioRepository } from "../domain/usuario.repository.js";


interface ObtenerUsuariosParams {
    negocio_id: string
    page: number
    perPage: number
    q?: string
    email?: string
    sucursal_id?: string | null
    roles?: string[] | null
}

interface ObtenerUsuariosRespuesta extends UsuarioSimple { }

export class ObtenerUsuariosUseCase {

    constructor(
        private readonly usuarioRepository: UsuarioRepository
    ) { }

    async execute({ negocio_id, page, perPage, q, email, sucursal_id, roles }: ObtenerUsuariosParams): Promise<{ total: number, usuarios: ObtenerUsuariosRespuesta[] }> {

        const filters: Record<string, any> = {};
        if (q) filters.q = q;
        if (email) filters.email = email;
        if (sucursal_id) filters.sucursal_id = sucursal_id;
        if (roles) filters.roles = roles;

        const { total, data } = await this.usuarioRepository.listar(negocio_id, { page, perPage }, filters)

        return {
            total, usuarios: data.map(usuario => ({
                id: usuario.id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                avatar_url: usuario.avatar_url,
                email: usuario.email,
                telefono: usuario.telefono,
                roles: usuario.roles,
                sucursal: usuario.sucursal ? {
                    id: usuario.sucursal.id,
                    nombre: usuario.sucursal.nombre,
                } : null
            }))
        }
    }
}