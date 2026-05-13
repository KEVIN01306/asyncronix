import type { Paginated } from "@shared/domain/paginated.js";
import type { PermisosRepository } from "../domain/permisos.repository.js";
import type { Permiso } from "../domain/permiso.entity.js";

export class ObtenerPermisosUseCase {
    constructor(private readonly permisosRepository: PermisosRepository) { }

    async execute(negocio_id: string, modulo_id?: string, page = 1, perPage = 1000): Promise<Paginated<Permiso>> {
        return this.permisosRepository.listarPermisos(negocio_id, modulo_id, { page, perPage });
    }
}
