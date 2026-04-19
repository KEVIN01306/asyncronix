import type { NegocioActualizar, NegocioCrear, NegocioObtenidoDetalle } from "./negocio.entity.js";

export interface NegocioRepository {
    registrar(data: NegocioCrear & { logo_url: string | null }): Promise<NegocioObtenidoDetalle>;
    actualizar(id: string, data: NegocioActualizar): Promise<NegocioObtenidoDetalle>;
    obtener(id: string): Promise<NegocioObtenidoDetalle | null>;
    obtenerPorWaId(wa_id: string): Promise<NegocioObtenidoDetalle | null>;
    listar(wa_id: string): Promise<NegocioObtenidoDetalle | null>;
}
