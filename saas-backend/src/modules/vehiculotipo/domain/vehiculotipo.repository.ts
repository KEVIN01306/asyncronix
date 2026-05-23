import type { Paginated } from "@shared/domain/paginated.js";
import type { VehiculoTipoSimple } from "./vehiculotipo.entity.js";

export interface VehiculoTipoRepository {
    listar(params: { page: number; perPage: number }): Promise<Paginated<VehiculoTipoSimple>>;
}
