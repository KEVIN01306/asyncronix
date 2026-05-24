import type { TipoServicioRepository } from "../domain/tipo-servicio.repository.js";

export class EliminarTipoServicioUseCase {
    constructor(private readonly repository: TipoServicioRepository) { }

    async execute(id: string, negocio_id: string) {
        await this.repository.eliminar(id, negocio_id);
    }
}
