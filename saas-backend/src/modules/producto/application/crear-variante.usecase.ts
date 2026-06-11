import type { VarianteCrear, VarianteDetalle } from "../domain/variante.entity.js";
import type { VarianteRepository } from "../domain/variante.repository.js";
import type { ObtenerSecuenciaUseCase } from "./obtener-secuencia.usecase.js";
import { crearCodigoSecuencial } from "@shared/infrastructure/codigo-secuencial.util.js";

export class CrearVarianteUseCase {
    constructor(private readonly repository: VarianteRepository, private readonly obtenerSecuencia?: ObtenerSecuenciaUseCase) { }

    async execute(variante: VarianteCrear, negocio_id: string): Promise<VarianteDetalle> {
        const created = await this.repository.crear(variante, negocio_id);

        if (this.obtenerSecuencia) {
            const sequence = await this.obtenerSecuencia.execute();
            const ean = crearCodigoSecuencial(sequence);
            const updated = await this.repository.actualizarCodigoSecuencial(created.id, ean, negocio_id);
            return updated;
        }

        return created;
    }
}
