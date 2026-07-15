import api from '../../../core/api/api.js';
import type { ReporteFinanciero, FiltrosReporteFinanciero } from '../domain/reportes.model.js';

export const reportesService = {
    obtenerReporteFinanciero: async (filtros: FiltrosReporteFinanciero): Promise<ReporteFinanciero> => {
        const params = new URLSearchParams();
        if (filtros.sucursal_ids?.length) params.append('sucursal_ids', filtros.sucursal_ids.join(','));
        if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
        if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
        if (filtros.metodos_pago?.length) params.append('metodos_pago', filtros.metodos_pago.join(','));
        if (filtros.entidad_tipos?.length) params.append('entidad_tipos', filtros.entidad_tipos.join(','));

        const response = await api.get(`/reportes/financiero?${params.toString()}`);
        return (response as any).data;
    },

    obtenerDetalleOrigen: async (origen: string, filtros: FiltrosReporteFinanciero): Promise<any> => {
        const params = new URLSearchParams();
        if (filtros.sucursal_ids?.length) params.append('sucursal_ids', filtros.sucursal_ids.join(','));
        if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
        if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
        if (filtros.metodos_pago?.length) params.append('metodos_pago', filtros.metodos_pago.join(','));
        if (filtros.entidad_tipos?.length) params.append('entidad_tipos', filtros.entidad_tipos.join(','));

        const response = await api.get(`/reportes/financiero/origen/${origen}?${params.toString()}`);
        return (response as any).data;
    }
};
