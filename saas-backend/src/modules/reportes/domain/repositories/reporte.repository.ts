import type { FiltrosReporteFinanciero, ReporteFinanciero, DetalleOrigenReporte } from '../models/reporte-financiero.model.js';

export interface ReporteRepository {
    obtenerReporteFinanciero(filtros: FiltrosReporteFinanciero): Promise<ReporteFinanciero>;
    obtenerDetallePorOrigen(filtros: FiltrosReporteFinanciero, origen: string): Promise<DetalleOrigenReporte>;
}
