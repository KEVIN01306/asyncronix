import type { ProductoDetalle, ProductoCrear } from "../domain/producto.entity.js";
import type { ProductoRepository } from "../domain/producto.repository.js";

export class RegistrarProductoUseCase {
    constructor(private readonly repository: ProductoRepository) { }

    async execute(data: ProductoCrear, negocio_id: string): Promise<ProductoDetalle> {

        return await this.repository.registrar(data, negocio_id);
    }
}
