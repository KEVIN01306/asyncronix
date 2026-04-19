import type { PrismaClient } from "@prisma/client";
import type { AuthRepository } from "../domain/auth.repository.js";
import type { UsuarioAutentificacion } from "../domain/auth-user.entity.js";
import type { Usuario } from "modules/usuarios/domain/usuario.entity.js";
import type { Session } from "../domain/auth-session.entity.js";
import { AuthMapper } from "./mappers/auth.mapper.js";


export class PrismaAuthRespository implements AuthRepository {

    constructor(private readonly db: PrismaClient) { }

    async buscarPorTelefono(
        telefono: UsuarioAutentificacion["telefono"]
    ): Promise<UsuarioAutentificacion | null> {

        const usuario = await this.db.usuarios.findUnique({
            where: { telefono, activo: true }
        })

        if (!usuario) return null

        return AuthMapper.mapUsuarioAutentificacion(usuario)
    }

    async buscarPorId(
        id: UsuarioAutentificacion["id"]
    ): Promise<UsuarioAutentificacion | null> {

        const usuario = await this.db.usuarios.findUnique({
            where: { id, activo: true }
        })

        if (!usuario) return null

        return AuthMapper.mapUsuarioAutentificacion(usuario)
    }

    async actualizarCrearSesion(
        usuario_id: Usuario["id"], 
        token: Session['token'], 
        fecha_expiracion: Date
    ): Promise<void> {

        await this.db.session.upsert({
            where: { usuario_id },
            update: {
                token,
                fecha_expiracion
            },
            create: {
                usuario_id,
                token,
                fecha_expiracion
            }
        })
    }

    async buscarSesionPorToken(
        token: Session["token"]
    ): Promise<Session | null> {
        
        const sessionDb = await this.db.session.findUnique({
            where: { token }
        });

        if (!sessionDb) return null;

        return {
            id: sessionDb.id,
            token: sessionDb.token,
            usuario_id: sessionDb.usuario_id,
            fecha_expiracion: sessionDb.fecha_expiracion,
            fecha_creacion: sessionDb.fecha_creacion
        }
    }
}