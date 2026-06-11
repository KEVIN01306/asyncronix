import AppError from '@shared/errors/AppError.js';
import { PersistenceError } from '@shared/database/errors/PersistenceError.js';
import { LoteNotFoundPersistenceError } from '@shared/database/errors/LoteNotFoundPersistenceError.js';
import { InsufficientStockPersistenceError } from '@shared/database/errors/InsufficientStockPersistenceError.js';
import { NotFoundPersistenceError } from '@shared/database/errors/NotFoundPersistenceError.js';
import type { TrasladoCrear, TrasladoDetalle } from '../domain/traslado.entity.js';
import type { TrasladoRepository } from '../domain/traslado.repository.js';

export class CrearTrasladoUseCase {
    constructor(private readonly repository: TrasladoRepository) { }

    async execute(data: TrasladoCrear, negocio_id: string, origen_id: string, usuario_id: string): Promise<TrasladoDetalle> {
        if (data.sucursal_destino_id === origen_id) {
            throw new AppError('La sucursal destino no puede ser igual a la sucursal origen', 'INVALID_DESTINO', 400);
        }

        if (!data.detalles || data.detalles.length === 0) {
            throw new AppError('Debe seleccionar al menos un lote para trasladar', 'DETALLES_REQUIRED', 400);
        }

        const detallesPorLote = data.detalles.reduce<Record<string, { lote_id: string; cantidad: number }>>((acc, detalle) => {
            const cantidad = Number(detalle.cantidad);
            if (Number.isNaN(cantidad) || cantidad < 1) {
                throw new AppError('La cantidad de traslado debe ser un número positivo', 'INVALID_QUANTITY', 400);
            }

            const existing = acc[detalle.lote_id];
            if (existing) {
                existing.cantidad += cantidad;
            } else {
                acc[detalle.lote_id] = {
                    lote_id: detalle.lote_id,
                    cantidad,
                };
            }
            return acc;
        }, {});

        const payload: TrasladoCrear = {
            sucursal_destino_id: data.sucursal_destino_id,
            detalles: Object.values(detallesPorLote),
        };

        try {
            return await this.repository.registrar(payload, negocio_id, usuario_id, origen_id);
        } catch (error: any) {
            if (error instanceof PersistenceError) {
                if (error instanceof LoteNotFoundPersistenceError) {
                    throw new AppError('Uno de los lotes no existe en la sucursal de origen', 'LOTE_NO_ENCONTRADO', 404);
                }

                if (error instanceof InsufficientStockPersistenceError) {
                    throw new AppError('Stock insuficiente en uno de los lotes seleccionados', 'INSUFICIENTE_STOCK', 400);
                }

                if (error instanceof NotFoundPersistenceError) {
                    throw new AppError('Sucursal destino no encontrada', 'SUCURSAL_DESTINO_NO_ENCONTRADA', 404);
                }

                throw new AppError(error.message || 'Error de persistencia al crear el traslado', 'PERSISTENCE_ERROR', 500);
            }

            throw error;
        }
    }
}
