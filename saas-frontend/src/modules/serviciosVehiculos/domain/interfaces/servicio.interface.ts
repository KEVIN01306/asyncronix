import type { ApiResponse, PaginatedResponse } from '../../../../core/api/interfaces/api-response.interface';
import type { EstadoVehiculoServicio } from '../servicio.constants';

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
    item?: {
        id: string;
        nombre: string;
    } | null;
    created_at: string;
    updated_at: string;
}

export interface ServicioRepuesto {
    id: string;
    servicio_id?: string | null;
    servicio_reparacion_id?: string | null;
    lote_id?: string | null;
    variante_id?: string | null;
    variante?: {
        id: string;
        sku?: string | null;
        producto?: {
            id: string;
            nombre: string;
            sku?: string;
        } | null;
        valores?: any[];
    } | any;
    cantidad: number;
    precio_venta: number;
    costo?: number | null;
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

export interface ServicioCustodia {
    id: string;
    servicio_id: string;
    descripcion?: string | null;
    firma_salida?: string | null;
    fecha_entrada: string;
    fecha_salida?: string | null;
    total: number;
    created_at: string;
    updated_at: string;
}

export interface CambioSiguienteServicio {
    id: string;
    servicio_id: string;
    item: string;
    created_at: string;
    updated_at: string;
}

export interface ServicioVehiculo {
    id: string;
    sucursal_id: string;
    vehiculo_id: string;
    cliente_id?: string | null;
    tipo_servicio_id?: string | null;
    descripcion?: string | null;
    diagnostico?: string | null;
    observaciones?: string | null;
    kilometraje?: number | null;
    kilometraje_proximo?: number | null;
    fecha_entrada?: string | null;
    fecha_salida?: string | null;
    firma_entrada?: string | null;
    firma_salida?: string | null;
    subtotal?: number | null;
    total?: number | null;
    efectivo_recibido?: number | null;
    vuelto?: number | null;
    estado: EstadoVehiculoServicio;
    MetodoPago: string;
    activo?: boolean;
    created_at?: string;
    updated_at?: string;
    imagenes?: ImagenServicio[];
    checklist?: ChecklistRespuesta[];
    repuestos?: ServicioRepuestoCliente[];
    repuestos_inventario?: ServicioRepuesto[];
    servicioReparacion?: ServicioReparacion[];
    servicioCustodias?: ServicioCustodia[];
    tareas?: ServicioTarea[];
    cambios_siguiente_servicio?: CambioSiguienteServicio[];
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
    extra: boolean;
    created_at: string;
    updated_at: string;
}

export type ServicioVehiculoEstado = Pick<ServicioVehiculo, 'id' | 'estado'>;
export type ServicioVehiculoDetailResponse = ApiResponse<ServicioVehiculo>;
export type ServicioVehiculoEstadoResponse = ApiResponse<ServicioVehiculoEstado>;
export type ServiciosVehiculoResponse = PaginatedResponse<ServicioVehiculo>;

export type ProcedenciaRepuesto = 'PROPIO' | 'CLIENTE';

export interface ServicioReparacionRepuesto {
    id: string;
    servicio_reparacion_id: string;
    descripccion: string;
    cantidad: number;
    instrucciones: string;
    entregado: boolean;
    procedencia: ProcedenciaRepuesto;
    created_at: string;
    updated_at: string;
}

export interface ServicioReparacion {
    id: string;
    servicio_id: string;
    firma_entrada?: string | null;
    firma_salida?: string | null;
    fecha_entrada: string;
    fecha_salida?: string | null;
    total: number;
    descripcion?: string | null;
    created_at: string;
    updated_at: string;
    servicio?: ServicioVehiculo;
    servicioReparacionRepuestos?: ServicioReparacionRepuesto[];
    servicioRepuestos?: ServicioRepuesto[];
}

export interface ServicioCustodia {
    id: string;
    servicio_id: string;
    firma_salida?: string | null;
    fecha_entrada: string;
    fecha_salida?: string | null;
    total: number;
    created_at: string;
    updated_at: string;
}
