import api from "../../../../core/api/api";
import type { Proveedor, ProveedorDetailResponse, ProveedoresResponse } from "../../domain/interfaces/proveedor.interface";
import type { ProveedorFormValues } from "../../domain/schemas/proveedor.schema";

const URL_MODULE = '/proveedores/'

export const proveedorRepository = {


    listar: async (limit: number = 10, offset: number = 0): Promise<ProveedoresResponse> => {

        const response = await api.get<ProveedoresResponse>(URL_MODULE, {
            params: { limit, offset }
        });

        return response;
    },

    Obtener: async (id: string): Promise<Proveedor> => {
        const response = await api.get<ProveedorDetailResponse>(`${URL_MODULE}${id}`)

        return response.data;
    },
    
    registrar: async (data: ProveedorFormValues): Promise<Proveedor> => {
        const response = await api.post<ProveedorDetailResponse>(URL_MODULE, data);
        return response.data;
    },
    
    actualizar: async (id: string, data: ProveedorFormValues): Promise<Proveedor> => {
        const response = await api.put<ProveedorDetailResponse>(`${URL_MODULE}${id}`, data);
        return response.data;
    }
}