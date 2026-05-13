import type { Permiso } from "../domain/permiso.entity.js";
import type { PermisosRepository } from "../domain/permisos.repository.js";

export class ObtenerPermisosRolUseCase {
    constructor(private readonly permisosRepository: PermisosRepository) { }

    async execute(rol_id: string, negocio_id: string): Promise<Permiso[]> {
        return this.permisosRepository.obtenerPermisosRol(rol_id, negocio_id);
    }
}
