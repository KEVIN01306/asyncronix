import type { Paginated } from "@shared/domain/paginated.js";
import type { ServicioDetalle, ServicioCrear, ServicioActualizar, ServicioSimple, ImagenServicio, ChecklistRespuestaSimple } from "./servicio.entity.js";

export interface ServicioRepository {
    listar(negocio_id: string, page: number, perPage: number): Promise<Paginated<ServicioSimple>>;
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
}
