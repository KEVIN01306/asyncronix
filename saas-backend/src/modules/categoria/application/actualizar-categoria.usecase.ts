import type { CategoriaSimple, CategoriaActualizar } from "../domain/categoria.entity.js";
import type { CategoriaRepository } from "../domain/categoria.repository.js";

export class ActualizarCategoriaUseCase {
    constructor(private readonly repository: CategoriaRepository) { }

    async execute(id: string, negocio_id: string, data: CategoriaActualizar): Promise<CategoriaSimple> {
        return await this.repository.actualizar(id, data, negocio_id);
    }
}
