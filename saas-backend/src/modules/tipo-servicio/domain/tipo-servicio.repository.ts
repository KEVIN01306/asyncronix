import type { TipoServicioActualizar, TipoServicioCrear, TipoServicioSimple } from "./tipo-servicio.entity.js";

export interface TipoServicioRepository {
    listar(negocio_id: string, page: number, perPage: number, q?: string | null): Promise<{ total: number; data: TipoServicioSimple[] }>;
    obtener(id: string, negocio_id: string): Promise<TipoServicioSimple>;
    registrar(data: TipoServicioCrear, negocio_id: string): Promise<TipoServicioSimple>;
    actualizar(id: string, negocio_id: string, data: TipoServicioActualizar): Promise<TipoServicioSimple>;
    eliminar(id: string, negocio_id: string): Promise<void>;
}
