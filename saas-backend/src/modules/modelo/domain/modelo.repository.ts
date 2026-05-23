import type { Paginated } from "@shared/domain/paginated.js";
import type { ModeloSimple } from "./modelo.entity.js";

export interface ModeloFilters {
    marca_id?: string[];
    linea_id?: string[];
    cilindrada_id?: string[];
}

export interface ModeloRepository {
    listar(params: { page: number; perPage: number; filters?: ModeloFilters }): Promise<Paginated<ModeloSimple>>;
    obtener(id: string): Promise<ModeloSimple | null>;
}
