import type { ApiResponse, PaginatedResponse } from '../../../../core/api/interfaces/api-response.interface';
import type { EstadoServicio } from '../servicio.constants';

export interface ImagenServicio {
    id: string;
    servicio_id: string;
    url: string;
    descripcion?: string | null;
    created_at: string;
    updated_at: string;
}

export interface ChecklistRespuesta {
    id: string;
    checklist_item_id: string;
    servicio_id: string;
    estado: string;
    observaciones?: string | null;
    created_at: string;
    updated_at: string;
}

export interface ServicioRepuestoCliente {
    id: string;
    servicio_id: string;
    repuesto: string;
    cantidad: number;
    created_at: string;
    updated_at: string;
}

export interface Servicio {
    id: string;
    sucursal_id: string;
    vehiculo_id: string;
    cliente_id?: string | null;
    tipo_servicio_id?: string | null;
    descripcion?: string | null;
    diagnostico?: string | null;
    kilometraje?: number | null;
    fecha_entrada?: string | null;
    fecha_salida?: string | null;
    firma_entrada?: string | null;
    firma_salida?: string | null;
    total?: number | null;
    estado: EstadoServicio;
    MetodoPago: string;
    activo?: boolean;
    created_at?: string;
    updated_at?: string;
    imagenes?: ImagenServicio[];
    checklist?: ChecklistRespuesta[];
    repuestos?: ServicioRepuestoCliente[];
    tareas?: ServicioTarea[];
    vehiculo?: {
        id: string;
        placa: string;
        modelo_id: string;
        modelo_nombre?: string | null;
        marca?: string | null;
        linea?: string | null;
        cilindrada?: number | null;
    } | null;
    tipo_servicio?: {
        id: string;
        nombre: string;
        precio_base: number;
    } | null;
    cliente?: {
        id: string;
        nombre: string;
        telefono?: string | null;
        email?: string | null;
    } | null;
    nombre_extra?: string | null;
    documento_extra?: string | null;
    numero_extra?: string | null;
    mecanico?: {
        id: string;
        nombre: string;
        apellido?: string | null;
        email?: string | null;
    } | null;
}

export interface ServicioTarea {
    id: string;
    servicio_id: string;
    nombre: string;
    completado: boolean;
    observacion?: string | null;
    created_at: string;
    updated_at: string;
}

export type ServicioDetailResponse = ApiResponse<Servicio>;
export type ServiciosResponse = PaginatedResponse<Servicio>;
