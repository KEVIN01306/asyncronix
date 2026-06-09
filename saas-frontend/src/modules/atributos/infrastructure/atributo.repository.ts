import api from '../../../core/api/api';

const URL = '/atributos/';

export const AtributoRepository = {
    listar: async () => {
        const response = await api.get(URL);
        return response;
    },
    crear: async (data: any) => {
        const response = await api.post(URL, data);
        return response;
    },
    actualizar: async (id: string, data: any) => {
        const response = await api.put(`${URL}${id}`, data);
        return response;
    },
    eliminar: async (id: string) => {
        const response = await api.delete(`${URL}${id}`);
        return response;
    },
    listarValores: async (id: string) => {
        const response = await api.get(`${URL}${id}/valores`);
        return response;
    },
    crearValor: async (id: string, data: any) => {
        const response = await api.post(`${URL}${id}/valores`, data);
        return response;
    },
    actualizarValor: async (id: string, data: any) => {
        const response = await api.put(`${URL}valores/${id}`, data);
        return response;
    },
    eliminarValor: async (id: string) => {
        const response = await api.delete(`${URL}valores/${id}`);
        return response;
    }
}

export default AtributoRepository;
