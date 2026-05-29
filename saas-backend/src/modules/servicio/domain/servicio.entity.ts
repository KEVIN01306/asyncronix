import type { TipoServicioSimple } from 'modules/tipo-servicio/domain/tipo-servicio.entity.js';
import type { EstadoServicio, MetodoPago } from './servicio.constants.js';

export interface ImagenServicio {
    id: string;
    servicio_id: string;
    url: string;
    created_at: Date;
    updated_at: Date;
}

export interface ChecklistRespuestaSimple {
    id: string;
    checklist_item_id: string;
    servicio_id: string;
    estado: string;
    observaciones?: string | null;
    item?: {
        id: string;
        nombre: string;
    } | null;
    created_at: Date;
    updated_at: Date;
}

export interface ServicioTarea {
    id: string;
    servicio_id: string;
    nombre: string;
    completado: boolean;
    observacion?: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface Servicio {
    id: string;
    negocio_id: string;
    sucursal_id: string;
    vehiculo_id: string;
    mecanico_id?: string | null;
    cliente_id?: string | null;
    nombre_extra?: string | null;
    documento_extra?: string | null;
    numero_extra?: string | null;
    tipo_servicio_id?: string | null;
    cliente?: {
        id: string;
        nombre: string;
        telefono?: string | null;
        email?: string | null;
    } | null;
    mecanico?: {
        id: string;
        nombre: string;
        apellido?: string | null;
        email?: string | null;
    } | null;
    repuestos?: ServicioRepuestoCliente[];
    descripcion?: string | null;
    diagnostico?: string | null;
    observaciones?: string | null;
    kilometraje?: number | null;
    fecha_entrada?: Date;
    fecha_salida?: Date | null;
    firma_entrada?: string | null;
    firma_salida?: string | null;
    total?: number;
    estado: EstadoServicio;
    MetodoPago: MetodoPago;
    activo?: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export type ServicioSimple = Pick<Servicio, 'id' | 'sucursal_id' | 'vehiculo_id' | 'cliente_id' | 'tipo_servicio_id' | 'estado' | 'total' | 'created_at'> & {
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
    mecanico?: {
        id: string;
        nombre: string;
        apellido?: string | null;
        email?: string | null;
    } | null;
};

export interface ServicioDetalle extends Servicio {
    imagenes: ImagenServicio[];
    checklist: ChecklistRespuestaSimple[];
    tareas: ServicioTarea[];
    tipo_servicio?: {
        id: string;
        nombre: string;
    } | null;
    repuestos_inventario?: ServicioRepuesto[];
}

export type ServicioCrear = Omit<Servicio, 'id' | 'activo' | 'created_at' | 'updated_at' | 'fecha_entrada' | 'estado'> & {
    total?: number;
    estado?: string;
};

export type ServicioActualizar = Partial<Omit<Servicio, 'id' | 'negocio_id' | 'activo' | 'created_at' | 'updated_at'>>;

export interface ServicioRepuestoCliente {
    id: string;
    servicio_id: string;
    repuesto: string;
    cantidad: number;
    created_at: Date;
    updated_at: Date;
}

export type ServicioRepuestoClienteCrear = {
    repuesto: string;
    cantidad: number;
    servicio_id?: string;
};

export interface ServicioRepuesto {
    id: string;
    servicio_id: string;
    lote_id?: string | null;
    producto?: { id: string; nombre: string } | null;
    cantidad: number;
    precio_venta: number;
    costo?: number | null;
    created_at: Date;
    updated_at: Date;
}
