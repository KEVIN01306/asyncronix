import type { Paginated } from "@shared/domain/paginated.js";
import type { ServicioDetalle, ServicioCrear, ServicioActualizar, ServicioSimple, ImagenServicio, ChecklistRespuestaSimple } from "./servicio.entity.js";

export interface ListarServiciosParams {
    negocio_id: string;
    page: number;
    perPage: number;
    estado?: string;
    placa?: string;
    codigo?: string;
    q?: string;
    mecanico_id?: string;
    usuario_id?: string;
    isAdministrador?: boolean;
}

export interface ServicioRepository {
    listar(params: ListarServiciosParams): Promise<Paginated<ServicioSimple>>;
    obtener(id: string, negocio_id: string): Promise<ServicioDetalle | null>;
    registrar(data: ServicioCrear, negocio_id: string): Promise<ServicioDetalle>;
    actualizar(id: string, negocio_id: string, data: ServicioActualizar): Promise<ServicioDetalle>;
    cambiarEstado(id: string, negocio_id: string, estado: string): Promise<ServicioDetalle>;
    guardarFirmaEntrada(servicio_id: string, firma_url: string, negocio_id: string): Promise<ServicioDetalle>;
    registrarImagen(servicio_id: string, url: string, negocio_id: string, descripcion?: string | null): Promise<ServicioDetalle>;
    registrarImagenProgreso(servicio_id: string, url: string, negocio_id: string, descripcion?: string | null): Promise<ServicioDetalle>;
    obtenerImagen(id: string): Promise<ImagenServicio | null>;
    eliminarImagen(id: string, negocio_id: string): Promise<void>;
    listarChecklistRespuestas(servicio_id: string, negocio_id: string): Promise<ChecklistRespuestaSimple[]>;
    registrarChecklistRespuesta(data: Omit<ChecklistRespuestaSimple, 'id' | 'created_at' | 'updated_at'>, negocio_id: string): Promise<ChecklistRespuestaSimple>;
    actualizarChecklistRespuesta(id: string, servicio_id: string, negocio_id: string, data: Partial<Omit<ChecklistRespuestaSimple, 'id' | 'servicio_id' | 'created_at' | 'updated_at'>>): Promise<ChecklistRespuestaSimple>;
    eliminarChecklistRespuesta(id: string, servicio_id: string, negocio_id: string): Promise<void>;
    actualizarTarea(id: string, servicio_id: string, negocio_id: string, data: { nombre?: string; completado?: boolean; observacion?: string | null }): Promise<void>;
    asociarCliente(servicio_id: string, negocio_id: string): Promise<ServicioDetalle>;
    actualizarClienteExterno(servicio_id: string, negocio_id: string, data: { nombre_extra: string; documento_extra: string; numero_extra: string }): Promise<ServicioDetalle>;
    asociarMecanico(servicio_id: string, mecanico_id: string, negocio_id: string): Promise<ServicioDetalle>;
    cambiarMecanico(servicio_id: string, mecanicoAnteriorId: string, mecanicoNuevoId: string, negocio_id: string): Promise<ServicioDetalle>;
    listarRepuestosCliente(servicio_id: string, negocio_id: string): Promise<import('./servicio.entity.js').ServicioRepuestoCliente[]>;
    registrarRepuestoCliente(data: import('./servicio.entity.js').ServicioRepuestoClienteCrear, servicio_id: string, negocio_id: string): Promise<import('./servicio.entity.js').ServicioRepuestoCliente>;
    eliminarRepuestoCliente(id: string, servicio_id: string, negocio_id: string): Promise<void>;
    // Inventory-backed repuestos (lote-based)
    crearRepuestosAtomicos(servicio_id: string, detalles: any[], negocio_id: string, sucursal_id: string): Promise<any[]>;
    crearRepuesto(servicio_id: string, detalle: any, negocio_id: string, sucursal_id: string): Promise<any>;
    eliminarRepuesto(id: string, servicio_id: string, negocio_id: string, sucursal_id: string): Promise<void>;
    eliminarTareas(servicio_id: string, negocio_id: string): Promise<void>;
    crearTareasDesdeTipoServicio(servicio_id: string, tipo_servicio_id: string | null, negocio_id: string): Promise<void>;
    actualizarObservaciones(id: string, negocio_id: string, observaciones: string | null): Promise<ServicioDetalle>;
}
