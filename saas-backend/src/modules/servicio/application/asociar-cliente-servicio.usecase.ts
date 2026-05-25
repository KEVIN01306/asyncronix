import type { ServicioRepository } from "../domain/servicio.repository.js";

export class AsociarClienteServicioUseCase {
    constructor(private readonly repository: ServicioRepository) { }

    async execute(servicio_id: string, negocio_id: string) {
        return this.repository.asociarCliente(servicio_id, negocio_id);
    }
}

export default AsociarClienteServicioUseCase;
