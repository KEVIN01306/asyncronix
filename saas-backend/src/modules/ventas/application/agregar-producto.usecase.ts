import AppError from "../../../shared/errors/AppError.js";
import { DatabaseError } from "../../../shared/database/errors/DatabaseError.js";
import { PersistenceError } from '../../../shared/database/errors/PersistenceError.js';
import { LoteNotFoundPersistenceError } from '../../../shared/database/errors/LoteNotFoundPersistenceError.js';
import { InsufficientStockPersistenceError } from '../../../shared/database/errors/InsufficientStockPersistenceError.js';
import { VentaNotFoundPersistenceError } from '../../../shared/database/errors/VentaNotFoundPersistenceError.js';
import type { VentaRepository } from "../domain/venta.repository.js";
import type { LoteRepository } from "../../lote/domain/lote.repository.js";
import type { VarianteRepository } from "../../producto/domain/variante.repository.js";
import { construirDetallesVentaPorVariante } from "./venta-detalles.builder.js";

export class AgregarProductoUseCase {
    constructor(
        private readonly ventaRepository: VentaRepository,
        private readonly loteRepository: LoteRepository,
        private readonly varianteRepository: VarianteRepository
    ) {}

    async execute(ventaId: string, codigo: string, cantidad: number, negocio_id: string, sucursal_id: string): Promise<any> {
        try {
            const variante = await this.varianteRepository.obtenerPorCodigo(codigo, negocio_id);
            if (!variante) {
                throw new AppError('Variante no encontrada', 'VARIANTE_NO_ENCONTRADA', 404);
            }

            const res = await this.loteRepository.listarPorVariante(variante.id, negocio_id, { page: 1, perPage: 1000 }, sucursal_id);
            const detallesToCreate = construirDetallesVentaPorVariante(variante, res.data, cantidad);
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
