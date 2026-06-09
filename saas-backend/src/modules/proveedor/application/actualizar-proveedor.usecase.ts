import type { ProveedorActualizar, ProveedorObtenidoDetalle } from '../domain/proveedor.entity.js';
import type { ProveedorRepository } from '../domain/proveedor.repository.js';

export class ActualizarProveedorUseCase {
    constructor(private readonly repo: ProveedorRepository) { }

    async execute(id: string, negocio_id: string, data: ProveedorActualizar): Promise<ProveedorObtenidoDetalle> {
        return this.repo.actualizar(id, negocio_id, data);
    }
}
