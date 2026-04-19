import type { Usuario } from "modules/usuarios/domain/usuario.entity.js";
import type { UsuarioAutentificacion } from "./auth-user.entity.js";
import type { Session } from "./auth-session.entity.js";

export interface AuthRepository {
    buscarPorTelefono(telefono: UsuarioAutentificacion['telefono']): Promise<UsuarioAutentificacion | null>
    buscarPorId(id: UsuarioAutentificacion['id']): Promise<UsuarioAutentificacion | null>
    buscarSesionPorToken(token: Session['token']): Promise<Session | null>
    actualizarCrearSesion( usuario_id: Usuario['id'], token: Session['token'], fecha_expiracion: Date ): Promise<void>
}