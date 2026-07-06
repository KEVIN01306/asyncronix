import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { UsuarioRepository } from "../domain/usuario.repository.js";
import type { Usuario } from "../domain/usuario.entity.js";
import type { HashProvider } from "@shared/domain/hash.provider.js";

export class ActualizarPinSucursalUseCase {
    constructor(
        private readonly usuarioRepository: UsuarioRepository,
        private readonly hashProvider: HashProvider
    ) {}

    async execute(id: Usuario["id"], negocio_id: Usuario["negocio_id"], pin_sucursal: string): Promise<void> {
        try {
            const pin_sucursal_hash = await this.hashProvider.hash(pin_sucursal);
            return await this.usuarioRepository.actualizarPinSucursal(id, negocio_id, pin_sucursal_hash);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
