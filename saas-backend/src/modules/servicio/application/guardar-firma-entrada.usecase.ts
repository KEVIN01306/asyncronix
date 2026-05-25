import type { ServicioRepository } from "../domain/servicio.repository.js";

export class GuardarFirmaEntradaUseCase {
    constructor(private readonly repository: ServicioRepository) { }

    async execute(servicio_id: string, firma_url: string, negocio_id: string) {
        return await this.repository.guardarFirmaEntrada(servicio_id, firma_url, negocio_id);
    }
}
