import AppError from "../../../shared/errors/AppError.js";
import { DatabaseError } from "../../../shared/database/errors/DatabaseError.js";
import type { VentaRepository } from "../domain/venta.repository.js";
import type { MetodoPago } from "@prisma/client";
import type { VentaSimple } from "../domain/venta.entity.js";
import type { Pagination } from "../../../shared/domain/pagination.js";
import type { Paginated } from "../../../shared/domain/paginated.js";

export class ObtenerVentasUseCase {
    constructor(private readonly ventaRepository: VentaRepository) {}

    async execute(negocio_id: string, sucursal_id: string, pagination: Pagination, cliente_id?: string | null, metodo_pago?: MetodoPago, q?: string, fecha_inicio?: string | null, fecha_fin?: string | null): Promise<Paginated<VentaSimple>> {
        try {
            return await this.ventaRepository.listar(negocio_id, sucursal_id, pagination, cliente_id, metodo_pago, q, fecha_inicio, fecha_fin);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos al obtener ventas', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
