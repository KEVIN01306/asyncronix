import AppError from "../../../shared/errors/AppError.js";
import { DatabaseError } from "../../../shared/database/errors/DatabaseError.js";
import { PersistenceError } from '../../../shared/database/errors/PersistenceError.js';
import { InsufficientStockPersistenceError } from '../../../shared/database/errors/InsufficientStockPersistenceError.js';
import { LoteNotFoundPersistenceError } from '../../../shared/database/errors/LoteNotFoundPersistenceError.js';
import type { VentaRepository } from "../domain/venta.repository.js";
import type { VentaCrear, VentaSimple } from "../domain/venta.entity.js";
import type { LoteRepository } from "../../lote/domain/lote.repository.js";
import type { VarianteRepository } from "modules/producto/domain/variante.repository.js";
import { construirDetallesVentaPorVariante } from "./venta-detalles.builder.js";

export class RegistrarVentaUseCase {
    constructor(
        private readonly ventaRepository: VentaRepository,
        private readonly loteRepository: LoteRepository,
        private readonly varianteRepository: VarianteRepository,        
        ) {}

    async execute(data: VentaCrear, negocio_id: string, sucursal_id: string, usuario_id: string, options?: { tx?: any, ignoreStock?: boolean }): Promise<VentaSimple> {
        if (!data.productos || data.productos.length === 0) {
            throw new AppError("La venta debe tener al menos un producto", "VENTA_SIN_PRODUCTOS", 400);
        }
        try {

            const detallesToPersist: any[] = [];
            let totalVenta = 0;
            let totalCosto = 0;

            for (const prodInput of data.productos) {
                const variante = await this.varianteRepository.obtener(prodInput.variante_id, negocio_id);
                if (!variante) {
                    throw new AppError(`VARIANTE_NO_ENCONTRADA_${prodInput.variante_id}`, "VARIANTE_NOT_FOUND", 404);
                }

                const res = await this.loteRepository.listarPorVariante(prodInput.variante_id, negocio_id, { page: 1, perPage: 1000 }, sucursal_id);
                const detalles = construirDetallesVentaPorVariante(variante, res.data, prodInput.cantidad, options?.ignoreStock);
                detallesToPersist.push(...detalles);
                totalVenta += detalles.reduce((sum, d) => sum + (d.precio_unitario * d.cantidad), 0);
                totalCosto += detalles.reduce((sum, d) => sum + (d.costo_unitario * d.cantidad), 0);
            }

            const dataToPersist = {
                ...data,
                estado: 'PENDIENTE' as const,
                detalles: detallesToPersist,
                total: totalVenta,
                total_costo: totalCosto
            } as any;

            return await this.ventaRepository.registrar(dataToPersist, negocio_id, sucursal_id, usuario_id, options);
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
