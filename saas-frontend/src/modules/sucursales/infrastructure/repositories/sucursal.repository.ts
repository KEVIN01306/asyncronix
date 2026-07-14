import api from "../../../../core/api/api";
import type { Sucursal, SucursalDetailResponse, SucursalMiDetalle, SucursalMiDetalleResponse, SucursalesResponse } from "../../domain/interfaces/sucursal.interface";
import type { SucursalFormValues } from "../../domain/schemas/sucursal.schema";

const URL_MODULO = '/sucursales/';

export const sucursalRepository = {
    listar: async (limit: number, offset: number, q?: string, signal?: AbortSignal): Promise<SucursalesResponse> => {
        const response = await api.get<SucursalesResponse>(`${URL_MODULO}`, {
            params: { limit, offset, q },
            signal
        });
        return response;
    },

    obtener: async (id: string): Promise<Sucursal> => {
        const response = await api.get<SucursalDetailResponse>(`${URL_MODULO}${id}`);
        return response.data;
    },

    obtenerMiSucursal: async (): Promise<SucursalMiDetalle> => {
        const response = await api.get<SucursalMiDetalleResponse>(`${URL_MODULO}me`);
        return response.data;
    },

    asignarCuentaBancaria: async (payload: { cuenta_bancaria_id: string; metodo_pago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO' }): Promise<SucursalMiDetalle> => {
        const response = await api.post<SucursalMiDetalleResponse>(`${URL_MODULO}me/cuentas-bancarias`, payload);
        return response.data;
    },

    registrar: async (data: SucursalFormValues): Promise<Sucursal> => {
        const response = await api.post<SucursalDetailResponse>(`${URL_MODULO}`, data);
        return response.data;
    },

    actualizar: async (id: string, data: SucursalFormValues): Promise<Sucursal> => {
        const response = await api.put<SucursalDetailResponse>(`${URL_MODULO}${id}`, data);
        return response.data;
    }
}