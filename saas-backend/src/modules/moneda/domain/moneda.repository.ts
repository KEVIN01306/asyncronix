import type { Paginated } from "@shared/domain/paginated.js";
import type { MonedaSimple } from "./moneda.entity.js";

export interface MonedaRepository {
    listar(params: { page: number; perPage: number; filters?: { q?: string } }): Promise<Paginated<MonedaSimple>>;
    obtener(id: string): Promise<MonedaSimple | null>;
}
