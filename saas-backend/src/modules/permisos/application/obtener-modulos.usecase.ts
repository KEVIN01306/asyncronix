import type { Modulo } from "../domain/permiso.entity.js";
import type { Paginated } from "@shared/domain/paginated.js";
import type { PermisosRepository } from "../domain/permisos.repository.js";

export class ObtenerModulosUseCase {
    constructor(private readonly permisosRepository: PermisosRepository) { }

    async execute(negocio_id: string, page = 1, perPage = 1000): Promise<Paginated<Modulo>> {
        return this.permisosRepository.listarModulos(negocio_id, { page, perPage });
    }
}
