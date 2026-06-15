import type { TipoServicioRepository } from "../domain/tipo-servicio.repository.js";

export class ObtenerTiposServicioUseCase {
    constructor(private readonly repository: TipoServicioRepository) { }

    async execute(negocio_id: string, page: number, perPage: number, q?: string | null) {
        return this.repository.listar(negocio_id, page, perPage, q);
    }
}
