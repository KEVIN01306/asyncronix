import api from '../../../../core/api/api';
import type { ApiResponse } from '../../../../core/api/interfaces/api-response.interface';
import type { 
    FacturacionConfigData, 
    ListarFacturasFiltrosParams, 
    ListarFacturasResponse, 
    ResumenFiscalData 
} from '../../domain/interfaces/factura.interface';
import type { FacturacionConfigFormValues } from '../../domain/schemas/facturacion-config.schema';

const BASE_URL = '/facturacion';

export const facturacionRepository = {
    /**
     * Consulta facturas emitidas por rango de fechas y filtros.
     */
    listar: async (params: ListarFacturasFiltrosParams, signal?: AbortSignal): Promise<ListarFacturasResponse> => {
        const queryParams = new URLSearchParams();
        if (params.periodo) queryParams.set('periodo', params.periodo);
        if (params.fecha_inicio) queryParams.set('fecha_inicio', params.fecha_inicio);
        if (params.fecha_fin) queryParams.set('fecha_fin', params.fecha_fin);
        if (params.page) queryParams.set('page', params.page.toString());
        if (params.limit) queryParams.set('limit', params.limit.toString());
        if (params.q) queryParams.set('q', params.q);

        const response = await api.get<ApiResponse<ListarFacturasResponse>>(`${BASE_URL}?${queryParams.toString()}`, { signal });
        return response.data;
    },

    /**
     * Obtiene el resumen fiscal consolidado para el período seleccionado.
     */
    obtenerResumenFiscal: async (
        params: { periodo?: string; fecha_inicio?: string; fecha_fin?: string },
        signal?: AbortSignal
    ): Promise<ResumenFiscalData> => {
        const queryParams = new URLSearchParams();
        if (params.periodo) queryParams.set('periodo', params.periodo);
        if (params.fecha_inicio) queryParams.set('fecha_inicio', params.fecha_inicio);
        if (params.fecha_fin) queryParams.set('fecha_fin', params.fecha_fin);

        const response = await api.get<ApiResponse<ResumenFiscalData>>(`${BASE_URL}/resumen?${queryParams.toString()}`, { signal });
        return response.data;
    },

    /**
     * Consulta la configuración fiscal actual del negocio (solo lectura).
     */
    obtenerConfiguracion: async (signal?: AbortSignal): Promise<FacturacionConfigData | null> => {
        const response = await api.get<ApiResponse<FacturacionConfigData | null>>(`${BASE_URL}/configuracion`, { signal });
        return response.data || null;
    },

    /**
     * Actualiza la configuración fiscal del negocio.
     */
    actualizarConfiguracion: async (data: FacturacionConfigFormValues): Promise<FacturacionConfigData> => {
        const response = await api.put<ApiResponse<FacturacionConfigData>>(`${BASE_URL}/configuracion`, data);
        return response.data;
    },

    /**
     * Obtiene la referencia / URL de descarga de XML o PDF.
     */
    obtenerDocumento: async (
        facturaId: string, 
        tipo: 'xml' | 'pdf'
    ): Promise<{ url: string; tipo: string; numero_factura: string; dte_uuid: string }> => {
        const response = await api.get<ApiResponse<{ url: string; tipo: string; numero_factura: string; dte_uuid: string }>>(
            `${BASE_URL}/${facturaId}/documento/${tipo}`
        );
        return response.data;
    },

    /**
     * Descarga directamente el archivo al navegador.
     */
    descargarArchivo: async (
        facturaId: string, 
        tipo: 'xml' | 'pdf',
        numeroFactura: string = 'factura'
    ): Promise<void> => {
        const info = await facturacionRepository.obtenerDocumento(facturaId, tipo);
        if (!info?.url) {
            throw new Error(`El documento ${tipo.toUpperCase()} no tiene URL de descarga válida`);
        }

        try {
            const res = await fetch(info.url);
            if (!res.ok) throw new Error("No se pudo obtener el archivo desde el servidor de almacenamiento");
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `${numeroFactura}.${tipo}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } catch {
            // Fallback directo abriendo en ventana nueva
            window.open(info.url, '_blank');
        }
    }
};
