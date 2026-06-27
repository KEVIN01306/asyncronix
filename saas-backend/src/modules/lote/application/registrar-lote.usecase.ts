import AppError from "@shared/errors/AppError.js";
import type { LoteCrear, LoteDetalle } from "../domain/lote.entity.js";
import type { LoteRepository } from "../domain/lote.repository.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import { PersistenceError } from "@shared/database/errors/PersistenceError.js";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";
import { RegularizarStockNegativoUseCase } from "./regularizar-stock-negativo.usecase.js";

export interface RegistrarLoteResultado {
    lote: LoteDetalle;
    regularizacionAutomatica: boolean;
    stockRegularizado: number;
    stockPendiente: number;
    mensaje: string;
}

export class RegistrarLoteUseCase {
    constructor(
        private readonly repository: LoteRepository,
        private readonly db: any,
        private readonly regularizarStockNegativoUseCase: RegularizarStockNegativoUseCase,
    ) { }

    async execute(data: LoteCrear, negocio_id: string): Promise<RegistrarLoteResultado> {
        try {
            const generateCode = () => `LOT-${(data.variante_id || '').slice(0, 6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
            const codigo_lote = data.codigo_lote || generateCode();
            const payload = { ...data, codigo_lote };

            return await this.db.$transaction(async (tx: any) => {
                const creado = await this.repository.registrar(payload, negocio_id, tx);

                const regularizacion = await this.regularizarStockNegativoUseCase.execute(tx, {
                    negocio_id,
                    sucursal_id: creado.sucursal_id,
                    variante_id: creado.variante_id,
                    lote_nuevo_id: creado.id,
                    stock_nuevo_lote: Number(creado.cantidad_actual ?? 0),
                });

                if (!regularizacion.regularizacionAutomatica) {
                    return {
                        lote: creado,
                        regularizacionAutomatica: false,
                        stockRegularizado: 0,
                        stockPendiente: 0,
                        mensaje: 'Lote creado con exito.',
                    };
                }

                return {
                    lote: creado,
                    regularizacionAutomatica: true,
                    stockRegularizado: regularizacion.stockRegularizado,
                    stockPendiente: regularizacion.stockPendiente,
                    mensaje: regularizacion.mensaje,
                };
            }, {
                maxWait: 5000,
                timeout: 15000,
            });
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof DatabaseError) {
                throw new AppError('Error en la base de datos', 'DATABASE_ERROR', 500);
            }
            if (error instanceof PersistenceError) {
                throw new AppError(error.message || 'Error de persistencia', 'PERSISTENCE_ERROR', 500);
            }

            throw PrismaErrorMapper.map(error);
        }
    }
}
