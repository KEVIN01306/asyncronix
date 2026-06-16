import type { Paginated } from "@shared/domain/paginated.js";
import type { RolRepository } from "../domain/rol.repository.js";
import type { RolSimple } from "../domain/rol.entity.js";

export class ObtenerRolesUseCase {
    constructor(private readonly rolRepository: RolRepository) { }

    async execute(params: { negocio_id: string, page: number, perPage: number, q?: string }): Promise<Paginated<RolSimple>> {
        return this.rolRepository.listar(params.negocio_id, { page: params.page, perPage: params.perPage }, params.q)
    }
}
