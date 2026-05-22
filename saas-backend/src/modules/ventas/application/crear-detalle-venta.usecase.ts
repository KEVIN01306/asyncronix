import AppError from "../../../shared/errors/AppError.js";
import { DatabaseError } from "../../../shared/database/errors/DatabaseError.js";
import { PersistenceError } from '../../../shared/database/errors/PersistenceError.js';
import { LoteNotFoundPersistenceError } from '../../../shared/database/errors/LoteNotFoundPersistenceError.js';
import { InsufficientStockPersistenceError } from '../../../shared/database/errors/InsufficientStockPersistenceError.js';
import { VentaNotFoundPersistenceError } from '../../../shared/database/errors/VentaNotFoundPersistenceError.js';
import type { VentaRepository } from "../domain/venta.repository.js";
import type { LoteRepository } from "../../lote/domain/lote.repository.js";
import type { ProductoRepository } from "modules/producto/domain/producto.repository.js";

export class CrearDetalleVentaUseCase {
    constructor(
        private readonly ventaRepository: VentaRepository,
        private readonly loteRepository: LoteRepository,
        private readonly productoRepository: ProductoRepository
        
        ) {}

    async execute(ventaId: string, productoId: string, cantidad: number, negocio_id: string, sucursal_id: string): Promise<any> {
        try {
            const producto = await this.productoRepository.obtener(productoId, negocio_id);
            if (!producto) {
                throw new AppError('Producto no encontrado', 'PRODUCTO_NO_ENCONTRADO', 404);
            }

            const res = await this.loteRepository.listarPorProducto(producto.id, negocio_id, { page: 1, perPage: 1000 }, sucursal_id);
            const lotes = res.data.filter((l: any) => l.activo && (l.cantidad_actual ?? 0) > 0);
            if (!lotes || lotes.length === 0) {
                throw new AppError('No hay lotes activos con stock para el producto', 'NO_LOTE_DISPONIBLE', 400);
            }

            let restante = cantidad;
            const detallesToCreate: any[] = [];

            for (const lote of lotes) {
                if (restante <= 0) break;
                const disponible = lote.cantidad_actual ?? 0;
                if (disponible <= 0) continue;

                const take = Math.min(restante, disponible);

                detallesToCreate.push({
                    lote_id: lote.id,
                    descripcion: lote.producto?.nombre ?? producto.nombre,
                    cantidad: take,
                    precio_unitario: producto.precio_sugerido ?? 0,
                    costo_unitario: lote.costo_compra ?? 0
                });

                restante -= take;
            }

            if (restante > 0) {
                throw new AppError('Stock insuficiente para completar la cantidad solicitada', 'INSUFICIENTE_STOCK', 400);
            }

            return await this.ventaRepository.crearDetallesAtomicos(ventaId, detallesToCreate, negocio_id, sucursal_id);
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            if (error instanceof PersistenceError) {
                if (error instanceof LoteNotFoundPersistenceError) throw new AppError('Lote no encontrado', 'LOTE_NO_ENCONTRADO', 404);
                if (error instanceof InsufficientStockPersistenceError) throw new AppError('Stock insuficiente para completar la cantidad solicitada', 'INSUFICIENTE_STOCK', 400);
                if (error instanceof VentaNotFoundPersistenceError) throw new AppError('Venta no encontrada', 'VENTA_NO_ENCONTRADA', 404);
                throw new AppError(error.message || 'Error de persistencia', 'PERSISTENCE_ERROR', 500);
            }
            if (error instanceof DatabaseError) throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
