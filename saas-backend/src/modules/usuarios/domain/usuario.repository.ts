import type { Pagination } from "@shared/domain/pagination.js";
import type { Usuario, UsuarioCrear, UsuarioActualizar, UsuarioObtenidoDetalle, UsuarioSimple } from "./usuario.entity.js";
import type { Paginated } from "@shared/domain/paginated.js";


export interface UsuarioRepository {
    obtener(id: Usuario['id'], negocio_id: Usuario['negocio_id']): Promise<UsuarioObtenidoDetalle | null>
    obtenerPorTelefono(telefono: Usuario['telefono']): Promise<UsuarioObtenidoDetalle | null>
    listar(negocio_id: Usuario['negocio_id'], pagination: Pagination): Promise<Paginated<UsuarioSimple>>
    registrar(data: UsuarioCrear, negocio_id: Usuario['negocio_id']): Promise<UsuarioSimple>
    actualizar(id: Usuario['id'], negocio_id: Usuario['negocio_id'], data: UsuarioActualizar): Promise<UsuarioSimple>
    eliminar(id: Usuario['id'], negocio_id: Usuario['negocio_id']): Promise<void>
}