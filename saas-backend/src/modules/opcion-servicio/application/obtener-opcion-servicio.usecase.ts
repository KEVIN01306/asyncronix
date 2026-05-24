import type { OpcionServicioRepository } from "../domain/opcion-servicio.repository.js";

export class ObtenerOpcionServicioUseCase {
    constructor(private readonly repository: OpcionServicioRepository) { }

    async execute(id: string, negocio_id: string) {
        return this.repository.obtener(id, negocio_id);
    }
}
