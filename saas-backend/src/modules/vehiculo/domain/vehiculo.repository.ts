import type { Paginated } from "@shared/domain/paginated.js";
import type { VehiculoSimple, VehiculoDetalle, VehiculoCrear, VehiculoActualizar } from "./vehiculo.entity.js";
import type { Pagination } from "@shared/domain/pagination.js";

export interface VehiculoFilters {
    q?: string;
    placa?: string;
    vehiculo_tipo_id?: string;
    modelo_id?: string;
    marca_id?: string;
    linea_id?: string;
    cliente_dpi?: string;
}

export interface VehiculoRepository {
    listar(negocio_id: string, pagination: Pagination, filters?: VehiculoFilters): Promise<Paginated<VehiculoSimple>>;
    obtener(id: string, negocio_id: string): Promise<VehiculoDetalle | null>;
    obtenerPorPlaca(placa: string, negocio_id: string): Promise<VehiculoDetalle | null>;
    crear(data: VehiculoCrear, negocio_id: string): Promise<VehiculoDetalle>;
    actualizar(id: string, negocio_id: string, data: VehiculoActualizar): Promise<VehiculoDetalle>;
    actualizarAvatar(id: string, negocio_id: string, avatar_url: string | null): Promise<void>;
    actualizarCalcomania(id: string, negocio_id: string, calcomania_url: string | null): Promise<void>;
}
