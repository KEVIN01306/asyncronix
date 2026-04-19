import type { CategoriaRepository } from "../domain/categoria.repository.js";

export class EliminarCategoriaUseCase {
    constructor(private readonly repository: CategoriaRepository) { }

    async execute(id: string, negocio_id: string): Promise<void> {
        await this.repository.eliminar(id, negocio_id);
    }
}
