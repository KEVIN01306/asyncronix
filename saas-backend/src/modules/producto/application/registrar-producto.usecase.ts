import { UniqueConstraintError } from "@shared/database/errors/UniqueConstraintError.js";
import type { ProductoDetalle, ProductoCrear } from "../domain/producto.entity.js";
import type { ProductoRepository } from "../domain/producto.repository.js";
import type { VarianteRepository } from "../domain/variante.repository.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";

export class RegistrarProductoUseCase {
    constructor(
        private readonly repository: ProductoRepository,
        private readonly varianteRepository: VarianteRepository
    ) { }

    async execute(data: ProductoCrear, negocio_id: string): Promise<ProductoDetalle> {
        try {
            const createdProduct = await this.repository.registrar(data, negocio_id);

            await this.varianteRepository.crear({
                producto_id: createdProduct.id,
                precio_sugerido: 0,
                codigo_barras: null,
                valor_atributo_ids: []
            }, negocio_id);

            const productoFinal = await this.repository.obtener(createdProduct.id, negocio_id);
            if (!productoFinal) throw new AppError('Producto no encontrado', 'PRODUCTO_NOT_FOUND', 404);

            return productoFinal;
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new AppError('El producto ya existe', 'DATA_ALREADY_EXISTS', 409);
            }

            if (error instanceof DatabaseError) {
                if (error.message === 'DATABASE_UNAVAILABLE') {
                    throw new AppError('Base de datos no disponible. Verifica la conexión al servidor MySQL.', 'DATABASE_UNAVAILABLE', 503);
                }

                throw new AppError('Error en la base de datos', 'DATABASE_ERROR', 500);
            }

            throw error;
        }
    }

}
