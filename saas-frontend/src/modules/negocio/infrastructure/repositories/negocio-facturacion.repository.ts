import api from '../../../../core/api/api';
import type { ApiResponse } from '../../../../core/api/interfaces/api-response.interface';
import type { NegocioFacturacionConfig } from '../../domain/interface/negocio-facturacion.interface';
import type { NegocioFacturacionFormValues } from '../../domain/schemas/negocio-facturacion.schema';

const URL = '/negocios/me/facturacion';

export const negocioFacturacionRepository = {
    obtener: async (): Promise<NegocioFacturacionConfig | null> => {
        const response = await api.get<ApiResponse<NegocioFacturacionConfig>>(URL);
        return response.data || null;
    },
    actualizar: async (data: NegocioFacturacionFormValues): Promise<NegocioFacturacionConfig> => {
        const response = await api.put<ApiResponse<NegocioFacturacionConfig>>(URL, data);
        return response.data;
    }
};
