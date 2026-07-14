import type { FiltrosReporteFinanciero, ReporteFinanciero } from '../models/reporte-financiero.model.js';

export interface ReporteRepository {
    obtenerReporteFinanciero(filtros: FiltrosReporteFinanciero): Promise<ReporteFinanciero>;
}
