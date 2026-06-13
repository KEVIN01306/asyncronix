import type { Paginated } from '../../../shared/domain/paginated.js';
import type { ProveedorSimple } from '../domain/proveedor.entity.js';
import type { ProveedorRepository } from '../domain/proveedor.repository.js';

export class ObtenerProveedoresUseCase {
    constructor(private readonly repo: ProveedorRepository) { }

    async execute(params: { negocio_id: string; page: number; perPage: number; q?: string | null }): Promise<Paginated<ProveedorSimple>> {
        return this.repo.listar(params);
    }
}
