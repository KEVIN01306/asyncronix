import type { ProveedorObtenidoDetalle } from '../domain/proveedor.entity.js';
import type { ProveedorRepository } from '../domain/proveedor.repository.js';

export class ObtenerProveedorUseCase {
    constructor(private readonly repo: ProveedorRepository) { }

    async execute(id: string, negocio_id: string): Promise<ProveedorObtenidoDetalle | null> {
        return this.repo.obtener(id, negocio_id);
    }
}
