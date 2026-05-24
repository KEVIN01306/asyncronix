import type { OpcionServicioRepository } from "../domain/opcion-servicio.repository.js";

export class ObtenerOpcionesServicioUseCase {
    constructor(private readonly repository: OpcionServicioRepository) { }

    async execute(negocio_id: string, page: number, perPage: number) {
        return this.repository.listar(negocio_id, page, perPage);
    }
}
