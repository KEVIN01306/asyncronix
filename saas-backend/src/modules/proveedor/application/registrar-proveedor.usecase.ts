import type { ProveedorCrear, ProveedorObtenidoDetalle } from '../domain/proveedor.entity.js';
import type { ProveedorRepository } from '../domain/proveedor.repository.js';

export class RegistrarProveedorUseCase {
    constructor(private readonly repo: ProveedorRepository) { }

    async execute(data: ProveedorCrear, negocio_id: string): Promise<ProveedorObtenidoDetalle> {
        return this.repo.registrar(data, negocio_id);
    }
}
