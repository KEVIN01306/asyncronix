import AppError from "../../../shared/errors/AppError.js";
import { DatabaseError } from "../../../shared/database/errors/DatabaseError.js";
import type { VentaRepository } from "../domain/venta.repository.js";
import type { LoteRepository } from "../../lote/domain/lote.repository.js";

export class CrearDetalleVentaUseCase {
    constructor(private readonly ventaRepository: VentaRepository, private readonly loteRepository: LoteRepository) {}

    async execute(ventaId: string, productoId: string, cantidad: number, negocio_id: string, sucursal_id: string): Promise<any> {
        try {
            // Buscar lotes disponibles del producto en la sucursal
            const res = await this.loteRepository.listarPorProducto(productoId, negocio_id, { page: 1, perPage: 100 });
            const lote = res.data.find((l: any) => l.sucursal_id === sucursal_id && l.activo && (l.cantidad_actual ?? 0) > 0);
            if (!lote) throw new AppError('No hay lotes activos con stock para el producto', 'NO_LOTE_DISPONIBLE', 400);

            const detalle = {
                lote_id: lote.id,
                descripcion: lote.producto?.nombre ?? '',
                cantidad,
                precio_unitario: lote.precio_venta ?? 0,
                costo_unitario: lote.costo_compra ?? 0
            };

            return await this.ventaRepository.crearDetalle(ventaId, detalle, negocio_id, sucursal_id);
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            if (error instanceof DatabaseError) throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
