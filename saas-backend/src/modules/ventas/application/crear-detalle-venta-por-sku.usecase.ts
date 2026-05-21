import AppError from "../../../shared/errors/AppError.js";
import { DatabaseError } from "../../../shared/database/errors/DatabaseError.js";
import type { VentaRepository } from "../domain/venta.repository.js";
import type { LoteRepository } from "../../lote/domain/lote.repository.js";
import type { ProductoRepository } from "../../producto/domain/producto.repository.js";

export class CrearDetalleVentaPorSkuUseCase {
    constructor(
        private readonly ventaRepository: VentaRepository,
        private readonly loteRepository: LoteRepository,
        private readonly productoRepository: ProductoRepository
    ) {}

    async execute(ventaId: string, sku: string, cantidad: number, negocio_id: string, sucursal_id: string): Promise<any> {
        try {
            const producto = await this.productoRepository.obtenerPorSku(sku, negocio_id);
            if (!producto) {
                throw new AppError('Producto no encontrado', 'PRODUCTO_NO_ENCONTRADO', 404);
            }

            const res = await this.loteRepository.listarPorProducto(producto.id, negocio_id, { page: 1, perPage: 100 });
            const lote = res.data.find((l: any) => l.sucursal_id === sucursal_id && l.activo && (l.cantidad_actual ?? 0) > 0);
            if (!lote) {
                throw new AppError('No hay lotes activos con stock para el producto', 'NO_LOTE_DISPONIBLE', 400);
            }

            const detalle = {
                lote_id: lote.id,
                descripcion: lote.producto?.nombre ?? producto.nombre,
                cantidad,
                precio_unitario: producto.precio_sugerido ?? 0,
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
