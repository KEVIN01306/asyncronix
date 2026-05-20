import { UniqueConstraintError } from "@shared/database/errors/UniqueConstraintError.js";
import { GenerarSku } from "../domain/actions/generarSku.action.js";
import type { ProductoDetalle, ProductoCrear } from "../domain/producto.entity.js";
import type { ProductoRepository } from "../domain/producto.repository.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";

export class RegistrarProductoUseCase {
    constructor(
        private readonly repository: ProductoRepository,
    ) { }

    async execute(data: ProductoCrear, negocio_id: string): Promise<ProductoDetalle> {

        try {
            const productoCreado = await this.repository.registrar(data, negocio_id);

            const sku = GenerarSku.ejecutar({
                negocioId: negocio_id,
                categoriaId: productoCreado.categoria_id,
                productoId: productoCreado.id,
                inicio: "P",
            });

            const prodcutoSku = await this.repository.actualizarSku(productoCreado.id, negocio_id, sku)

            return prodcutoSku ;
        }catch (error) {

            if (error instanceof UniqueConstraintError) {
                throw new AppError('El producto ya existe', 'DATA_ALREADY_EXISTS', 409)
            }

            if (error instanceof DatabaseError) {
                throw new AppError('Error en la base de datos', 'DATABASE_ERROR', 500)
            }
            
            throw error
        }

    }
}
