import type { OpcionServicioRepository } from "../domain/opcion-servicio.repository.js";

export class EliminarOpcionServicioUseCase {
    constructor(private readonly repository: OpcionServicioRepository) { }

    async execute(id: string, negocio_id: string) {
        await this.repository.eliminar(id, negocio_id);
    }
}
