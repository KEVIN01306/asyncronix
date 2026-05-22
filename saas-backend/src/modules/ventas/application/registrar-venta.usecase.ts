import AppError from "../../../shared/errors/AppError.js";
import { DatabaseError } from "../../../shared/database/errors/DatabaseError.js";
import { PersistenceError } from '../../../shared/database/errors/PersistenceError.js';
import { InsufficientStockPersistenceError } from '../../../shared/database/errors/InsufficientStockPersistenceError.js';
import { LoteNotFoundPersistenceError } from '../../../shared/database/errors/LoteNotFoundPersistenceError.js';
import type { VentaRepository } from "../domain/venta.repository.js";
import type { VentaCrear, VentaSimple } from "../domain/venta.entity.js";
import type { LoteRepository } from "../../lote/domain/lote.repository.js";
import type { ProductoRepository } from "modules/producto/domain/producto.repository.js";

export class RegistrarVentaUseCase {
    constructor(
        private readonly ventaRepository: VentaRepository,
        private readonly loteRepository: LoteRepository,
        private readonly productoRepository: ProductoRepository
        
        ) {}

    async execute(data: VentaCrear, negocio_id: string, sucursal_id: string, usuario_id: string): Promise<VentaSimple> {
        if (!data.productos || data.productos.length === 0) {
            throw new AppError("La venta debe tener al menos un producto", "VENTA_SIN_PRODUCTOS", 400);
        }
        try {

            const detallesToPersist: any[] = [];
            let totalVenta = 0;
            let totalCosto = 0;

            for (const prodInput of data.productos) {
                const producto = await this.productoRepository.obtener(prodInput.producto_id, negocio_id);
                if (!producto) {
                    throw new AppError(`PRODUCTO_NO_ENCONTRADO_${prodInput.producto_id}`, "PRODUCT_NOT_FOUND", 404);
                }

                const res = await this.loteRepository.listarPorProducto(prodInput.producto_id, negocio_id, { page: 1, perPage: 1000 }, sucursal_id);
                const lotes = res.data.filter((l: any) => l.activo && (l.cantidad_actual ?? 0) > 0);
                if (!lotes || lotes.length === 0) {
                    throw new AppError(`INSUFICIENTE_STOCK_${prodInput.producto_id}`, "INSUFFICIENT_STOCK", 400);
                }

                let restante = prodInput.cantidad;
                const precioUnitario = producto.precio_sugerido ?? 0;

                // distribuir la cantidad requerida entre los lotes disponibles
                for (const lote of lotes) {
                    if (restante <= 0) break;
                    const disponible = lote.cantidad_actual ?? 0;
                    if (disponible <= 0) continue;

                    const take = Math.min(restante, disponible);
                    const costoUnitario = lote.costo_compra ?? 0;

                    detallesToPersist.push({
                        lote_id: lote.id,
                        descripcion: producto.nombre ?? lote.producto?.nombre ?? '',
                        cantidad: take,
                        precio_unitario: precioUnitario,
                        costo_unitario: costoUnitario
                    });

                    totalVenta += take * precioUnitario;
                    totalCosto += take * costoUnitario;

                    restante -= take;
                }

                if (restante > 0) {
                    throw new AppError(`INSUFICIENTE_STOCK_${prodInput.producto_id}`, "INSUFFICIENT_STOCK", 400);
                }
            }

            const dataToPersist = {
                ...data,
                estado: 'PENDIENTE' as const,
                detalles: detallesToPersist,
                total: totalVenta,
                total_costo: totalCosto
            } as any;

            return await this.ventaRepository.registrar(dataToPersist, negocio_id, sucursal_id, usuario_id);
        } catch (error: any) {
            if (error instanceof PersistenceError) {
                if (error instanceof InsufficientStockPersistenceError) {
                    throw new AppError(`Stock insuficiente para el producto seleccionado`, "INSUFICIENT_STOCK", 400);
                }
                if (error instanceof LoteNotFoundPersistenceError) {
                    throw new AppError(`Lote no encontrado`, "LOTE_NO_ENCONTRADO", 404);
                }
                throw new AppError(error.message || 'Error de persistencia', 'PERSISTENCE_ERROR', 500);
            }
            if (error.message && error.message.includes("PRODUCTO_NO_ENCONTRADO")) {
                throw new AppError("Uno de los productos seleccionados no existe o no está disponible", "PRODUCT_NOT_FOUND", 404);
            }
            if (error instanceof DatabaseError) {
                throw new AppError(`Error en base de datos al registrar venta: ${error.message}`, 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
