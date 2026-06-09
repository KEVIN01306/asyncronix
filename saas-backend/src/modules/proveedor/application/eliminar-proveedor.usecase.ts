import type { ProveedorRepository } from '../domain/proveedor.repository.js';

export class EliminarProveedorUseCase {
    constructor(private readonly repo: ProveedorRepository) { }

    async execute(id: string, negocio_id: string): Promise<void> {
        return this.repo.eliminar(id, negocio_id);
    }
}
