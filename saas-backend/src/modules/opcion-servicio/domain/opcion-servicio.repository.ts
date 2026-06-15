import type { OpcionServicioCrear, OpcionServicioActualizar, OpcionServicioSimple } from "./opcion-servicio.entity.js";

export interface OpcionServicioRepository {
    listar(negocio_id: string, page: number, perPage: number, q?: string | null): Promise<{ total: number; data: OpcionServicioSimple[] }>;
    obtener(id: string, negocio_id: string): Promise<OpcionServicioSimple>;
    registrar(data: OpcionServicioCrear, negocio_id: string): Promise<OpcionServicioSimple>;
    actualizar(id: string, negocio_id: string, data: OpcionServicioActualizar): Promise<OpcionServicioSimple>;
    eliminar(id: string, negocio_id: string): Promise<void>;
}
