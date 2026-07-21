import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { Usuario, UsuarioSimple, UsuarioActualizarPerfil } from "../domain/usuario.entity.js";
import type { UsuarioRepository } from "../domain/usuario.repository.js";

export class ActualizarPerfilUseCase {
    constructor(private readonly usuarioRepository: UsuarioRepository) { }

    async execute(id: Usuario["id"], negocio_id: Usuario["negocio_id"], data: UsuarioActualizarPerfil): Promise<UsuarioSimple> {
        try {
            // Verificar si el correo cambió
            if (data.email !== undefined) {
                const usuarioActual = await this.usuarioRepository.obtener(id, negocio_id);
                if (usuarioActual && usuarioActual.email !== data.email) {
                    data.verificado = false;
                }
            }
            
            return await this.usuarioRepository.actualizarPerfil(id, negocio_id, data);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
