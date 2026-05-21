import AppError from "../../../shared/errors/AppError.js";
import { DatabaseError } from "../../../shared/database/errors/DatabaseError.js";
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
                    throw new Error(`PRODUCTO_NO_ENCONTRADO_${prodInput.producto_id}`);
                }

                const res = await this.loteRepository.listarPorProducto(prodInput.producto_id, negocio_id, { page: 1, perPage: 100 });
                const lote = res.data.find((l: any) => l.sucursal_id === sucursal_id && l.activo && (l.cantidad_actual ?? 0) > 0);
                if (!lote) {
                    throw new Error(`INSUFICIENTE_STOCK_${prodInput.producto_id}`);
                }

                const precioUnitario = producto.precio_sugerido ?? 0;
                const costoUnitario = lote.costo_compra ?? 0;

                detallesToPersist.push({
                    lote_id: lote.id,
                    descripcion: producto.nombre ?? lote.producto?.nombre ?? '',
                    cantidad: prodInput.cantidad,
                    precio_unitario: precioUnitario,
                    costo_unitario: costoUnitario
                });

                totalVenta += prodInput.cantidad * precioUnitario;
                totalCosto += prodInput.cantidad * costoUnitario;
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
            if (error.message && error.message.includes("INSUFICIENTE_STOCK")) {
                throw new AppError(`Stock insuficiente para el producto seleccionado`, "INSUFICIENT_STOCK", 400);
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
