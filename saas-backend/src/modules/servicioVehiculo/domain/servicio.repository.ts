import type { Paginated } from "@shared/domain/paginated.js";
import type { ServicioDetalle, ServicioCrear, ServicioActualizar, ServicioSimple, ImagenServicio, ChecklistRespuestaSimple, ServicioTarea, CambioSiguienteServicio, ServicioReparacion, ServicioCustodia, ServicioReparacionRepuesto } from "./servicio.entity.js";

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
    obtenerEstado(id: string, negocio_id: string): Promise<Pick<ServicioSimple, 'id' | 'estado'> | null>;
    registrar(data: ServicioCrear, negocio_id: string, recepcionista_id: string, options?: { tx?: any }): Promise<ServicioDetalle>;
    actualizar(id: string, negocio_id: string, data: ServicioActualizar, options?: { tx?: any }): Promise<ServicioDetalle>;
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
    crearRepuestosAtomicos(servicio_id: string, detalles: any[], negocio_id: string, sucursal_id: string, servicio_reparacion_id?: string): Promise<any[]>;
    crearRepuesto(servicio_id: string, detalle: any, negocio_id: string, sucursal_id: string, servicio_reparacion_id?: string): Promise<any>;
    eliminarRepuesto(id: string, servicio_id: string, negocio_id: string, sucursal_id: string): Promise<void>;
    eliminarTareasNoExtra(servicio_id: string, negocio_id: string): Promise<void>;
    crearTareasDesdeTipoServicio(servicio_id: string, tipo_servicio_id: string | null, negocio_id: string): Promise<void>;
    crearTarea(servicio_id: string, data: { nombre: string; extra?: boolean }, negocio_id: string): Promise<ServicioTarea>;
    eliminarTarea(id: string, servicio_id: string, negocio_id: string): Promise<void>;
    listarCambiosSiguienteServicio(servicio_id: string, negocio_id: string): Promise<CambioSiguienteServicio[]>;
    crearCambioSiguienteServicio(servicio_id: string, data: { item: string }, negocio_id: string): Promise<CambioSiguienteServicio>;
    eliminarCambioSiguienteServicio(id: string, servicio_id: string, negocio_id: string): Promise<void>;
    actualizarChecklistRespuestasPorTipoServicio(servicio_id: string, tipo_servicio_id: string | null, negocio_id: string): Promise<void>;
    actualizarObservaciones(id: string, negocio_id: string, observaciones: string | null): Promise<ServicioDetalle>;

    // Reparación
    obtenerReparacionActiva(servicio_id: string, negocio_id: string): Promise<ServicioReparacion | null>;
    crearReparacion(servicio_id: string, firma_entrada: string, negocio_id: string, options?: { tx?: any }): Promise<ServicioReparacion>;
    obtenerReparacion(id: string, negocio_id: string): Promise<ServicioReparacion | null>;
    actualizarReparacion(reparacion_id: string, data: { total?: number, descripcion?: string, fecha_salida?: Date, firma_salida?: string }, negocio_id: string): Promise<ServicioReparacion>;

    // Repuestos solicitados
    crearReparacionRepuesto(reparacion_id: string, data: Omit<ServicioReparacionRepuesto, 'id' | 'servicio_reparacion_id' | 'created_at' | 'updated_at'>, negocio_id: string): Promise<ServicioReparacionRepuesto>;
    actualizarReparacionRepuesto(id: string, reparacion_id: string, data: Partial<Omit<ServicioReparacionRepuesto, 'id' | 'servicio_reparacion_id' | 'created_at' | 'updated_at'>>, negocio_id: string): Promise<ServicioReparacionRepuesto>;
    eliminarReparacionRepuesto(id: string, reparacion_id: string, negocio_id: string): Promise<void>;

    // Custodia
    crearCustodia(servicio_id: string, negocio_id: string, options?: { tx?: any }): Promise<ServicioCustodia>;
    actualizarCustodia(id: string, negocio_id: string, data: { descripcion?: string | null, total?: number, fecha_salida?: Date, firma_salida?: string }): Promise<ServicioCustodia>;
}
