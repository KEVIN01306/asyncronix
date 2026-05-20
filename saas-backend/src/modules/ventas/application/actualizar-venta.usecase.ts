import AppError from "../../../shared/errors/AppError.js";
import { DatabaseError } from "../../../shared/database/errors/DatabaseError.js";
import type { VentaRepository } from "../domain/venta.repository.js";
import type { VentaActualizar, VentaSimple } from "../domain/venta.entity.js";

export class ActualizarVentaUseCase {
    constructor(private readonly ventaRepository: VentaRepository) {}

    async execute(id: string, data: VentaActualizar, negocio_id: string, sucursal_id: string): Promise<VentaSimple> {
        if (data.productos && data.productos.length === 0) {
            throw new AppError("La venta no puede quedar sin productos", "VENTA_SIN_PRODUCTOS", 400);
        }
        try {
            return await this.ventaRepository.actualizar(id, data, negocio_id, sucursal_id);
        } catch (error: any) {
            if (error.message === "VENTA_NO_ENCONTRADA") {
                throw new AppError("La venta no existe", "NOT_FOUND", 404);
            }
            if (error.message === "VENTA_NO_EDITABLE") {
                throw new AppError("No se puede editar una venta completada o anulada", "BAD_REQUEST", 400);
            }
            if (error.message && error.message.includes("INSUFICIENTE_STOCK")) {
                throw new AppError(`Stock insuficiente para el producto seleccionado`, "INSUFICIENT_STOCK", 400);
            }
            if (error.message && error.message.includes("PRODUCTO_NO_ENCONTRADO")) {
                throw new AppError("Uno de los productos seleccionados no existe o no está disponible", "PRODUCT_NOT_FOUND", 404);
            }
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos al actualizar venta', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
