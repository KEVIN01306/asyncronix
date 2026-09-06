import api from '../../../../core/api/api';
import type { ServicioVehiculo, ServicioVehiculoDetailResponse, ServicioVehiculoEstadoResponse, ServicioVehiculoEstado, ServiciosVehiculoResponse } from '../../domain/interfaces/servicio.interface';

const URL_MODULE = '/servicio-vehiculos';

export type ServicioVehiculoListParams = {
    limit: number;
    offset: number;
    estado?: string;
    placa?: string;
    codigo?: string;
    q?: string;
    mecanico_id?: string;
};

export const servicioRepository = {
    listar: async (params: ServicioVehiculoListParams): Promise<ServiciosVehiculoResponse> => {
        const searchParams = { ...params } as Record<string, unknown>;
        Object.keys(searchParams).forEach((key) => {
            const value = searchParams[key];
            if (value === undefined || value === '') {
                delete searchParams[key];
            }
        });

        const response = await api.get<ServiciosVehiculoResponse>(`${URL_MODULE}`, {
            params: searchParams
        });
        return response as any;
    },

    obtener: async (id: string): Promise<ServicioVehiculo> => {
        const response = await api.get<ServicioVehiculoDetailResponse>(`${URL_MODULE}/${id}`) as unknown as ServicioVehiculoDetailResponse;
        return response.data;
    },

    obtenerEstado: async (id: string): Promise<ServicioVehiculoEstado> => {
        const response = await api.get<ServicioVehiculoEstadoResponse>(`${URL_MODULE}/${id}/estado`) as unknown as ServicioVehiculoEstadoResponse;
        return response.data;
    },

    registrar: async (data: any): Promise<ServicioVehiculo> => {
        const response = await api.post<ServicioVehiculoDetailResponse>(`${URL_MODULE}`, data) as unknown as ServicioVehiculoDetailResponse;
        return response.data;
    },

    actualizar: async (id: string, data: any): Promise<ServicioVehiculo> => {
        const response = await api.put<ServicioVehiculoDetailResponse>(`${URL_MODULE}/${id}`, data) as unknown as ServicioVehiculoDetailResponse;
        return response.data;
    },

    cambiarEstado: async (id: string, estado: string): Promise<ServicioVehiculo> => {
        const response = await api.patch<ServicioVehiculoDetailResponse>(`${URL_MODULE}/${id}/estado`, { estado }) as unknown as ServicioVehiculoDetailResponse;
        return response.data;
    },

    listoSalida: async (id: string): Promise<ServicioVehiculo> => {
        const response = await api.post<ServicioVehiculoDetailResponse>(`${URL_MODULE}/${id}/listo-salida`) as unknown as ServicioVehiculoDetailResponse;
        return response.data;
    },

    finalizarSalida: async (
        id: string,
        firmas: Record<string, File>,
        metodo_pago: string,
        efectivo_recibido?: number | null,
        vuelto?: number | null,
        opcionesFinancieras?: {
            caja_id?: string;
            token_autorizado?: string;
            forzar_caja_en_linea?: boolean;
            cuenta_bancaria_id?: string;
        },
        cliente_id?: string
    ) => {
        const formData = new FormData();
        Object.entries(firmas).forEach(([key, file]) => {
            formData.append(key, file);
        });
        formData.append('metodo_pago', metodo_pago);
        if (efectivo_recibido != null) formData.append('efectivo_recibido', String(efectivo_recibido));
        if (vuelto != null) formData.append('vuelto', String(vuelto));

        if (opcionesFinancieras?.caja_id) formData.append('caja_id', opcionesFinancieras.caja_id);
        if (opcionesFinancieras?.token_autorizado) formData.append('token_autorizado', opcionesFinancieras.token_autorizado);
        if (opcionesFinancieras?.forzar_caja_en_linea) formData.append('forzar_caja_en_linea', String(opcionesFinancieras.forzar_caja_en_linea));
        if (opcionesFinancieras?.cuenta_bancaria_id) formData.append('cuenta_bancaria_id', opcionesFinancieras.cuenta_bancaria_id);
        if (cliente_id) formData.append('cliente_id', cliente_id);

        const response = await api.post<ServicioVehiculoDetailResponse>(`${URL_MODULE}/${id}/salida`, formData) as unknown as ServicioVehiculoDetailResponse;

        return response.data;
    },

    subirImagen: async (id: string, file: File, descripcion?: string): Promise<ServicioVehiculo> => {
        const formData = new FormData();
        formData.append('imagen', file);
        if (descripcion) formData.append('descripcion', descripcion);

        const response = await api.post<ServicioVehiculoDetailResponse>(`${URL_MODULE}/${id}/imagenes`, formData) as unknown as ServicioVehiculoDetailResponse;
        return response.data;
    },

    guardarFirmaEntrada: async (id: string, file: File): Promise<ServicioVehiculo> => {
        const formData = new FormData();
        formData.append('firma', file);

        const response = await api.post<ServicioVehiculoDetailResponse>(`${URL_MODULE}/${id}/firma-entrada`, formData) as unknown as ServicioVehiculoDetailResponse;
        return response.data;
    },

    eliminarImagen: async (id: string, imagenId: string): Promise<void> => {
        await api.delete(`${URL_MODULE}/${id}/imagenes/${imagenId}`);
    },

    subirImagenProgreso: async (id: string, file: File, descripcion?: string): Promise<ServicioVehiculo> => {
        const formData = new FormData();
        formData.append('imagen', file);
        if (descripcion) formData.append('descripcion', descripcion);

        const response = await api.post<ServicioVehiculoDetailResponse>(`${URL_MODULE}/${id}/progreso/imagenes`, formData) as unknown as ServicioVehiculoDetailResponse;
        return response.data;
    },

    registrarTarea: async (id: string, data: { nombre: string; extra?: boolean }): Promise<any> => {
        const response = await api.post(`${URL_MODULE}/${id}/tareas`, data);
        return response.data.data;
    },

    actualizarTarea: async (id: string, tareaId: string, data: { nombre?: string; completado?: boolean; observacion?: string | null }): Promise<void> => {
        await api.put(`${URL_MODULE}/${id}/tareas/${tareaId}`, data);
    },

    eliminarTarea: async (id: string, tareaId: string): Promise<void> => {
        await api.delete(`${URL_MODULE}/${id}/tareas/${tareaId}`);
    },

    listarCambiosSiguienteServicio: async (id: string): Promise<any[]> => {
        const response = await api.get<any>(`${URL_MODULE}/${id}/cambios-siguiente-servicio`);
        return response.data.data;
    },

    crearCambioSiguienteServicio: async (id: string, data: { item: string }): Promise<any> => {
        const response = await api.post<any>(`${URL_MODULE}/${id}/cambios-siguiente-servicio`, data);
        return response.data.data;
    },

    eliminarCambioSiguienteServicio: async (id: string, cambioId: string): Promise<void> => {
        await api.delete(`${URL_MODULE}/${id}/cambios-siguiente-servicio/${cambioId}`);
    },

    actualizarObservaciones: async (id: string, data: { observaciones?: string | null }): Promise<ServicioVehiculo> => {
        const response = await api.put<ServicioVehiculoDetailResponse>(`${URL_MODULE}/${id}/observaciones`, data);
        return response.data;
    },

    listarChecklistRespuestas: async (id: string): Promise<any[]> => {
        const response = await api.get<any>(`${URL_MODULE}/${id}/checklist-respuestas`);
        return response.data.data;
    },

    registrarChecklistRespuesta: async (id: string, data: any): Promise<any> => {
        const response = await api.post<any>(`${URL_MODULE}/${id}/checklist-respuestas`, data);
        return response.data.data;
    },

    actualizarChecklistRespuesta: async (id: string, respuestaId: string, data: any): Promise<any> => {
        const response = await api.put<any>(`${URL_MODULE}/${id}/checklist-respuestas/${respuestaId}`, data);
        return response.data.data;
    },

    eliminarChecklistRespuesta: async (id: string, respuestaId: string): Promise<void> => {
        await api.delete(`${URL_MODULE}/${id}/checklist-respuestas/${respuestaId}`);
    },
    
    asociarCliente: async (id: string): Promise<ServicioVehiculo> => {
        const response = await api.post<ServicioVehiculoDetailResponse>(`${URL_MODULE}/${id}/asociar-cliente`);
        return response.data;
    }
    ,
    asociarMecanico: async (id: string, mecanicoId: string): Promise<ServicioVehiculo> => {
        const response = await api.post<ServicioVehiculoDetailResponse>(`${URL_MODULE}/${id}/asociar-mecanico`, { mecanico_id: mecanicoId });
        return response.data;
    },
    crearRepuestoCliente: async (servicioId: string, data: { nombre: string; cantidad: number }) => {
        const response = await api.post(`${URL_MODULE}/${servicioId}/repuestos-cliente`, data);
        return response.data;
    },
    eliminarRepuestoCliente: async (servicioId: string, id: string) => {
        const response = await api.delete(`${URL_MODULE}/${servicioId}/repuestos-cliente/${id}`);
        return response.data;
    },
    crearRepuesto: async (servicioId: string, data: { variante_id?: string; codigo?: string; cantidad: number; sucursal_id: string }) => {
        const response = await api.post(`${URL_MODULE}/${servicioId}/repuestos`, data);
        return response.data;
    },
    eliminarRepuesto: async (servicioId: string, id: string, sucursal_id: string) => {
        const response = await api.delete(`${URL_MODULE}/${servicioId}/repuestos/${id}`, { data: { sucursal_id } });
        return response.data;
    },
    cambiarMecanico: async (id: string, mecanicoAnteriorId: string, mecanicoNuevoId: string): Promise<ServicioVehiculo> => {
        const response = await api.post<ServicioVehiculoDetailResponse>(`${URL_MODULE}/${id}/cambiar-mecanico`, { mecanicoAnteriorId, mecanicoNuevoId });
        return response.data;
    },
    actualizarClienteExterno: async (id: string, data: { nombre_extra: string; documento_extra: string; numero_extra: string }): Promise<ServicioVehiculo> => {
        const response = await api.put<ServicioVehiculoDetailResponse>(`${URL_MODULE}/${id}/cliente-externo`, data);
        return response.data;
    },
    mandarReparacion: async (id: string, file: File) => {
        const formData = new FormData();
        formData.append('firma_entrada', file);
        const response = await api.post(`${URL_MODULE}/${id}/reparacion`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    mandarCustodia: async (id: string) => {
        const response = await api.post(`${URL_MODULE}/${id}/custodia`);
        return response.data;
    },
    obtenerReparacion: async (id: string) => {
        const response: any = await api.get(`${URL_MODULE}/${id}/reparacion-activa`);
        return response.data;
    },
    actualizarReparacion: async (id: string, data: { total?: number, descripcion?: string }) => {
        const response: any = await api.patch(`${URL_MODULE}/reparacion/${id}`, data);
        return response.data;
    },
    crearRepuestoSolicitado: async (reparacionId: string, data: any) => {
        const response: any = await api.post(`${URL_MODULE}/reparacion/${reparacionId}/repuestos-solicitados`, data);
        return response.data;
    },
    actualizarRepuestoSolicitado: async (reparacionId: string, repuestoId: string, data: any) => {
        const response: any = await api.put(`${URL_MODULE}/reparacion/${reparacionId}/repuestos-solicitados/${repuestoId}`, data);
        return response.data;
    },
    eliminarRepuestoSolicitado: async (reparacionId: string, repuestoId: string) => {
        const response: any = await api.delete(`${URL_MODULE}/reparacion/${reparacionId}/repuestos-solicitados/${repuestoId}`);
        return response.data;
    },
    actualizarCustodia: async (id: string, custodiaId: string, data: { total?: number, descripcion?: string | null }) => {
        const response: any = await api.patch(`${URL_MODULE}/${id}/custodia/${custodiaId}`, data);
        return response.data;
    },
    terminarCustodia: async (id: string, custodiaId: string, file: File) => {
        const formData = new FormData();
        formData.append('firma_salida', file);
        const response = await api.post(`${URL_MODULE}/${id}/custodia/${custodiaId}/finalizar`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    terminarReparacion: async (id: string, reparacionId: string, file: File) => {
        const formData = new FormData();
        formData.append('firma_salida', file);
        const response = await api.post(`${URL_MODULE}/${id}/reparacion/${reparacionId}/finalizar`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};
