import type { Pagination } from "@shared/domain/pagination.js";
import type { Usuario, UsuarioCrear, UsuarioActualizar, UsuarioObtenidoDetalle, UsuarioSimple, UsuarioActualizarPerfil } from "./usuario.entity.js";
import type { Paginated } from "@shared/domain/paginated.js";


export interface UsuarioRepository {
    obtener(id: Usuario['id'], negocio_id: Usuario['negocio_id']): Promise<UsuarioObtenidoDetalle | null>
    obtenerPorTelefono(telefono: Usuario['telefono']): Promise<UsuarioObtenidoDetalle | null>
    listar(negocio_id: Usuario['negocio_id'], pagination: Pagination, filters?: Record<string, any>): Promise<Paginated<UsuarioSimple>>
    registrar(data: UsuarioCrear, negocio_id: Usuario['negocio_id']): Promise<UsuarioSimple>
    actualizar(id: Usuario['id'], negocio_id: Usuario['negocio_id'], data: UsuarioActualizar): Promise<UsuarioSimple>
    eliminar(id: Usuario['id'], negocio_id: Usuario['negocio_id']): Promise<void>
    actualizarPerfil(id: Usuario['id'], negocio_id: Usuario['negocio_id'], data: UsuarioActualizarPerfil): Promise<UsuarioSimple>
    actualizarAvatar(id: Usuario['id'], negocio_id: Usuario['negocio_id'], avatar_url: string): Promise<void>
    cambiarPassword(id: Usuario['id'], negocio_id: Usuario['negocio_id'], password_hash: string): Promise<void>
    actualizarPinCaja(id: Usuario['id'], negocio_id: Usuario['negocio_id'], pin_caja: string): Promise<void>
    actualizarPinModelo(id: Usuario['id'], negocio_id: Usuario['negocio_id'], pin_modelo: string): Promise<void>
    actualizarPinSucursal(id: Usuario['id'], negocio_id: Usuario['negocio_id'], pin_sucursal: string): Promise<void>
    obtenerPinSucursal(id: Usuario['id'], negocio_id: Usuario['negocio_id']): Promise<string | null>
    contar(negocio_id: string): Promise<number>
    marcarComoVerificado(id: string, negocio_id: string): Promise<void>
}