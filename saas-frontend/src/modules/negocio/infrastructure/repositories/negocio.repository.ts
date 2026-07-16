import api from '../../../../core/api/api'
import type { Negocio } from '../../domain/negocio.schema';
import type { NegocioEditFormValues } from '../../domain/negocio.schema';

export class NegocioRepository {
    async obtenerMiNegocio(): Promise<Negocio> {
        const response = await api.get('/negocios/me');
        return response.data;
    }

    async actualizarMiNegocio(data: NegocioEditFormValues | FormData): Promise<Negocio> {
        const response = await api.put('/negocios/me', data);
        return response.data;
    }

    async cambiarMoneda(moneda_id: string): Promise<Negocio> {
        const response = await api.put('/negocios/me/moneda', { moneda_id });
        return response.data;
    }

    async obtenerLimites(): Promise<import('../../domain/negocio.schema').NegocioLimiteItem[]> {
        const response = await api.get('/negocios/me/limites');
        return response.data?.data || response.data;
    }
}

export const negocioRepository = new NegocioRepository();   