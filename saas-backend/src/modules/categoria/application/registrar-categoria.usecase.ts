import type { CategoriaSimple, CategoriaCrear } from "../domain/categoria.entity.js";
import type { CategoriaRepository } from "../domain/categoria.repository.js";

export class RegistrarCategoriaUseCase {
    constructor(private readonly repository: CategoriaRepository) { }

    async execute(data: CategoriaCrear, negocio_id: string): Promise<CategoriaSimple> {
        return await this.repository.registrar(data, negocio_id);
    }
}
