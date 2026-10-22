import type { Paginated } from "../../../shared/domain/paginated.js";
import type { ClienteActualizar, ClienteCrear, ClienteObtenidoDetalle, ClienteSimple, ConteoRelacionesCliente } from "./cliente.entity.js";

export interface ClienteRepository {
    registrar(data: ClienteCrear, passwordHash: string | null, negocioId: string): Promise<ClienteObtenidoDetalle>;
    actualizar(id: string, data: ClienteActualizar): Promise<ClienteObtenidoDetalle>;
    asociarNegocio(clienteId: string, negocioId: string): Promise<void>;
    estaAsociadoANegocio(clienteId: string, negocioId: string): Promise<boolean>;
    eliminar(id: string): Promise<void>;
    obtenerPorId(id: string): Promise<ClienteObtenidoDetalle | null>;
    buscarPorDpi(dpi: string): Promise<ClienteObtenidoDetalle | null>;
    buscarPorNit(nit: string): Promise<ClienteObtenidoDetalle | null>;
    buscarPorDocumento(data: { nit?: string | null; dpi?: string | null }): Promise<ClienteObtenidoDetalle | null>;
    buscarPorDocumentoYNegocio(data: { nit?: string | null; dpi?: string | null }, negocioId: string): Promise<ClienteObtenidoDetalle | null>;
    listar(params: { negocio_id: string; page: number; perPage: number; q?: string | null; documento?: string | null }): Promise<Paginated<ClienteSimple>>;
    buscarGlobal(params: { q?: string | null; documento?: string | null; limit: number }): Promise<ClienteSimple[]>;
    obtenerConteoRelaciones(id: string): Promise<ConteoRelacionesCliente>;
    unificar(params: {
        clienteConservarId: string;
        clienteEliminarId: string;
        negocioId: string;
        usuarioId: string;
        datosFusionados: Partial<ClienteActualizar>;
    }): Promise<{ relacionesMigradas: ConteoRelacionesCliente }>;
    eliminarSesiones(clienteId: string): Promise<void>;
}
