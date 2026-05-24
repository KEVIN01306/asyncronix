import type { TipoServicioRepository } from "../domain/tipo-servicio.repository.js";

export class ObtenerTipoServicioUseCase {
    constructor(private readonly repository: TipoServicioRepository) { }

    async execute(id: string, negocio_id: string) {
        return this.repository.obtener(id, negocio_id);
    }
}
