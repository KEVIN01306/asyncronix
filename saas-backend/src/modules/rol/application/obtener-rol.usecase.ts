import AppError from "@shared/errors/AppError.js";
import type { RolObtenidoDetalle } from "../domain/rol.entity.js";
import type { RolRepository } from "../domain/rol.repository.js";

export class ObtenerRolUseCase {
    constructor(private readonly rolRepository: RolRepository) { }

    async execute(params: { id: string, negocio_id: string }): Promise<RolObtenidoDetalle> {
        const rol = await this.rolRepository.obtener(params.id, params.negocio_id)

        if (!rol) {
            throw new AppError('El rol no existe', 'RECORD_NOT_FOUND', 404)
        }

        return rol
    }
}
