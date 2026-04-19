import type { Paginated } from "../../../shared/domain/paginated.js";
import type { ClienteActualizar, ClienteCrear, ClienteObtenidoDetalle, ClienteSimple } from "./cliente.entity.js";

export interface ClienteRepository {
    registrar(data: ClienteCrear, negocio_id: string): Promise<ClienteObtenidoDetalle>;
    actualizar(id: string, negocio_id: string, data: ClienteActualizar): Promise<ClienteObtenidoDetalle>;
    eliminar(id: string, negocio_id: string): Promise<void>;
    obtener(id: string, negocio_id: string): Promise<ClienteObtenidoDetalle | null>;
    listar(params: { negocio_id: string; page: number; perPage: number }): Promise<Paginated<ClienteSimple>>;
}
