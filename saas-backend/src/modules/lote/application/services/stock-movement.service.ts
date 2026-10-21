import type { Prisma, PrismaClient } from "@prisma/client";
import AppError from "../../../../shared/errors/AppError.js";
import { StockInsuficienteError } from "../../domain/errors/stock-insuficiente.error.js";
import { LoteNoEncontradoError } from "../../domain/errors/lote-no-encontrado.error.js";
import { CantidadInvalidaError } from "../../domain/errors/cantidad-invalida.error.js";
import type {
    DescontarStockInput,
    IncrementarStockInput,
    StockResultado,
} from "../../domain/stock-movement.types.js";

type DbContext = Prisma.TransactionClient | PrismaClient;

function validarCantidad(cantidad: number, accion: string): void {
    if (
        typeof cantidad !== "number" ||
        !Number.isFinite(cantidad) ||
        cantidad <= 0 ||
        Math.floor(cantidad) !== cantidad
    ) {
        throw new CantidadInvalidaError(
            `La cantidad a ${accion} debe ser un número entero mayor que cero`
        );
    }
}

/**
 * Función centralizada para descontar stock de un lote específico.
 * Garantiza consistencia atómica, validación de disponibilidad y sincronización del stock total de la variante.
 */
export async function descontarStock(
    db: DbContext,
    input: DescontarStockInput
): Promise<StockResultado> {
    validarCantidad(input.cantidad, "descontar");

    const lote = await db.lote.findUnique({
        where: { id: input.lote_id },
    });

    if (!lote) {
        throw new LoteNoEncontradoError();
    }

    if (input.negocio_id && lote.negocio_id !== input.negocio_id) {
        throw new AppError(
            "El lote no pertenece al negocio especificado",
            "LOTE_NO_AUTORIZADO",
            403
        );
    }

    const actual = Number(lote.cantidad_actual ?? 0);
    const esLoteNegativo = lote.codigo_lote === "SYS_LOTE_NEGATIVO";
    const permiteNegativo = Boolean(input.permitirStockNegativo || esLoteNegativo);

    if (!permiteNegativo && actual < input.cantidad) {
        throw new StockInsuficienteError("Stock insuficiente en el lote");
    }

    let nuevaCantidad: number;

    if (!permiteNegativo) {
        const updateResult = await db.lote.updateMany({
            where: {
                id: input.lote_id,
                cantidad_actual: { gte: input.cantidad },
            },
            data: {
                cantidad_actual: { decrement: input.cantidad },
            },
        });

        if (updateResult.count === 0) {
            throw new StockInsuficienteError("Stock insuficiente en el lote");
        }

        nuevaCantidad = actual - input.cantidad;
        const nuevoActivo = nuevaCantidad > 0;

        await db.lote.update({
            where: { id: input.lote_id },
            data: { activo: nuevoActivo },
        });
    } else {
        nuevaCantidad = actual - input.cantidad;
        const nuevoActivo = esLoteNegativo ? true : nuevaCantidad > 0;

        await db.lote.update({
            where: { id: input.lote_id },
            data: {
                cantidad_actual: { decrement: input.cantidad },
                activo: nuevoActivo,
            },
        });
    }

    // Sincronizar stock_total en la variante
    await db.varianteProducto.update({
        where: { id: lote.variante_id },
        data: {
            stock_total: { decrement: input.cantidad },
        },
    });

    const agg = await db.lote.aggregate({
        where: { variante_id: lote.variante_id, activo: true },
        _sum: { cantidad_actual: true },
    });
    const stockTotalVariante = Number(agg._sum.cantidad_actual ?? 0);

    return {
        lote_id: lote.id,
        variante_id: lote.variante_id,
        negocio_id: lote.negocio_id,
        sucursal_id: lote.sucursal_id,
        cantidad_anterior: actual,
        cantidad_modificada: input.cantidad,
        cantidad_actual: nuevaCantidad,
        activo: esLoteNegativo ? true : nuevaCantidad > 0,
        stock_total_variante: stockTotalVariante,
    };
}

/**
 * Función centralizada para incrementar o devolver stock a un lote específico.
 * Garantiza consistencia atómica, restitución al lote de origen y sincronización del stock total de la variante.
 */
export async function incrementarStock(
    db: DbContext,
    input: IncrementarStockInput
): Promise<StockResultado> {
    validarCantidad(input.cantidad, "incrementar");

    const lote = await db.lote.findUnique({
        where: { id: input.lote_id },
    });

    if (!lote) {
        throw new LoteNoEncontradoError();
    }

    if (input.negocio_id && lote.negocio_id !== input.negocio_id) {
        throw new AppError(
            "El lote no pertenece al negocio especificado",
            "LOTE_NO_AUTORIZADO",
            403
        );
    }

    const actual = Number(lote.cantidad_actual ?? 0);
    const nuevaCantidad = actual + input.cantidad;
    const esLoteNegativo = lote.codigo_lote === "SYS_LOTE_NEGATIVO";
    const nuevoActivo = esLoteNegativo ? nuevaCantidad < 0 : nuevaCantidad > 0;

    await db.lote.update({
        where: { id: input.lote_id },
        data: {
            cantidad_actual: { increment: input.cantidad },
            activo: nuevoActivo,
        },
    });

    // Sincronizar stock_total en la variante
    await db.varianteProducto.update({
        where: { id: lote.variante_id },
        data: {
            stock_total: { increment: input.cantidad },
        },
    });

    const agg = await db.lote.aggregate({
        where: { variante_id: lote.variante_id, activo: true },
        _sum: { cantidad_actual: true },
    });
    const stockTotalVariante = Number(agg._sum.cantidad_actual ?? 0);

    return {
        lote_id: lote.id,
        variante_id: lote.variante_id,
        negocio_id: lote.negocio_id,
        sucursal_id: lote.sucursal_id,
        cantidad_anterior: actual,
        cantidad_modificada: input.cantidad,
        cantidad_actual: nuevaCantidad,
        activo: nuevoActivo,
        stock_total_variante: stockTotalVariante,
    };
}

/**
 * Alias semántico para devolución de stock, preservando la trazabilidad hacia el lote de origen.
 */
export const devolverStock = incrementarStock;
