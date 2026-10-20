import AppError from "../../../../shared/errors/AppError.js";

export type PeriodoPreset = '24_horas' | '7_dias' | '30_dias' | 'este_mes' | 'custom';

export interface DateRangeResult {
    inicio: Date;
    fin: Date;
}

/**
 * Obtiene el rango de fechas en UTC correspondiente a la zona horaria de Guatemala (UTC-6).
 */
export function resolverRangoFechas(
    periodo?: string | null,
    fechaInicioStr?: string | null,
    fechaFinStr?: string | null
): DateRangeResult {
    const ahora = new Date();
    // Offset Guatemala UTC-6 (fijo, sin DST)
    const OFFSET_GUATEMALA_MS = -6 * 60 * 60 * 1000;

    const normalizado = (periodo || 'este_mes').toLowerCase().trim();

    if (normalizado === 'custom' || (!periodo && (fechaInicioStr || fechaFinStr))) {
        if (!fechaInicioStr || !fechaFinStr) {
            throw new AppError(
                "Para un rango personalizado debe especificar 'fecha_inicio' y 'fecha_fin'",
                "FECHAS_INVALIDAS",
                400
            );
        }

        // Si viene solo YYYY-MM-DD
        let inicio: Date;
        let fin: Date;

        if (fechaInicioStr.includes('T')) {
            inicio = new Date(fechaInicioStr);
        } else {
            // YYYY-MM-DD a las 00:00:00 en hora de Guatemala -> UTC = +6 horas
            inicio = new Date(`${fechaInicioStr}T00:00:00-06:00`);
        }

        if (fechaFinStr.includes('T')) {
            fin = new Date(fechaFinStr);
        } else {
            // YYYY-MM-DD a las 23:59:59.999 en hora de Guatemala
            fin = new Date(`${fechaFinStr}T23:59:59.999-06:00`);
        }

        if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
            throw new AppError("Formato de fecha inválido", "FECHAS_INVALIDAS", 400);
        }

        if (inicio > fin) {
            throw new AppError(
                "La fecha de inicio no puede ser posterior a la fecha final",
                "RANGO_FECHAS_INVALIDO",
                400
            );
        }

        return { inicio, fin };
    }

    if (normalizado === '24_horas' || normalizado === 'ultimas_24_horas' || normalizado === '24h') {
        const inicio = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
        return { inicio, fin: ahora };
    }

    if (normalizado === '7_dias' || normalizado === 'ultimos_7_dias') {
        const inicio = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { inicio, fin: ahora };
    }

    if (normalizado === '30_dias' || normalizado === 'ultimos_30_dias') {
        const inicio = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { inicio, fin: ahora };
    }

    if (normalizado === 'este_mes') {
        // En hora de Guatemala:
        const fechaLocalGt = new Date(ahora.getTime() + OFFSET_GUATEMALA_MS);
        const anio = fechaLocalGt.getUTCFullYear();
        const mes = fechaLocalGt.getUTCMonth(); // 0-indexed

        const pad = (n: number) => String(n).padStart(2, '0');
        const mesStr = pad(mes + 1);

        // Primer día del mes a las 00:00:00 en Guatemala
        const inicio = new Date(`${anio}-${mesStr}-01T00:00:00-06:00`);
        return { inicio, fin: ahora };
    }

    // Default fallback: este mes
    const fechaLocalGt = new Date(ahora.getTime() + OFFSET_GUATEMALA_MS);
    const anio = fechaLocalGt.getUTCFullYear();
    const mes = fechaLocalGt.getUTCMonth();
    const pad = (n: number) => String(n).padStart(2, '0');
    const mesStr = pad(mes + 1);
    const inicio = new Date(`${anio}-${mesStr}-01T00:00:00-06:00`);
    return { inicio, fin: ahora };
}
