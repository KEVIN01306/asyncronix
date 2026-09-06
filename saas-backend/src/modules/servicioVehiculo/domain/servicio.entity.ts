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
    extra: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface CambioSiguienteServicio {
    id: string;
    servicio_id: string;
    item: string;
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
        dpi?: string | null;
    } | null;
    recepcionista_id?: string | null;
    vehiculo?: {
        id: string;
        placa: string;
        modelo_id: string;
        modelo_nombre?: string | null;
        marca?: string | null;
        linea?: string | null;
        cilindrada?: number | null;
        modelo?: {
            id: string;
            modelo: string;
        } | null;
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
    kilometraje_proximo?: number | null;
    fecha_entrada?: Date;
    fecha_salida?: Date | null;
    firma_entrada?: string | null;
    firma_salida?: string | null;
    subtotal?: number;
    total?: number;
    efectivo_recibido?: number | null;
    vuelto?: number | null;
    estado: EstadoServicio;
    MetodoPago: MetodoPago;
    activo?: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export type ServicioSimple = Pick<Servicio, 'id' | 'sucursal_id' | 'vehiculo_id' | 'cliente_id' | 'tipo_servicio_id' | 'estado' | 'subtotal' | 'total' | 'created_at'> & {
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
        dpi?: string | null;
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
    cambios_siguiente_servicio: CambioSiguienteServicio[];
    tipo_servicio?: {
        id: string;
        nombre: string;
    } | null;
    repuestos_inventario?: ServicioRepuesto[];
    servicioReparacion?: any[];
    servicioCustodias?: ServicioCustodia[];
    factura?: any;
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
    servicio_id?: string | null;
    servicio_reparacion_id?: string | null;
    variante_id: string;
    lote_id?: string | null;
    variante?: {
        id: string;
        sku: string;
        codigo_barras?: string | null;
        correlativo?: string | null;
        qr_codigo?: string | null;
        precio_sugerido?: number | null;
        stock_total?: number | null;
        producto?: { id: string; nombre: string } | null;
        valores?: Array<{
            id: string;
            atributo?: { id: string; nombre: string } | null;
            valor: string;
        }>;
    } | null;
    cantidad: number;
    precio_venta: number;
    costo?: number | null;
    created_at: Date;
    updated_at: Date;
}

export type ProcedenciaRepuesto = 'PROPIO' | 'CLIENTE';

export interface ServicioReparacion {
    id: string;
    servicio_id: string;
    firma_entrada?: string | null;
    firma_salida?: string | null;
    fecha_entrada: Date;
    fecha_salida?: Date | null;
    total: number;
    created_at: Date;
    updated_at: Date;
    servicio?: ServicioSimple;
    repuestos_solicitados?: ServicioReparacionRepuesto[];
    repuestos_inventario?: ServicioRepuesto[];
}

export interface ServicioCustodia {
    id: string;
    servicio_id: string;
    descripcion?: string | null;
    firma_salida?: string | null;
    fecha_entrada: Date;
    fecha_salida?: Date | null;
    total: number;
    created_at: Date;
    updated_at: Date;
    servicio?: ServicioSimple;
}

export interface ServicioReparacionRepuesto {
    id: string;
    servicio_reparacion_id: string;
    descripccion: string;
    cantidad: number;
    instrucciones: string;
    entregado: boolean;
    procedencia: ProcedenciaRepuesto;
    created_at: Date;
    updated_at: Date;
}
