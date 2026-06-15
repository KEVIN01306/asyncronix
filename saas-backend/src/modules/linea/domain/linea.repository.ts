import type { Paginated } from "@shared/domain/paginated.js";
import type { LineaSimple } from "./linea.entity.js";

export interface LineaRepository {
    listar(params: { page: number; perPage: number; filters?: { q?: string } }): Promise<Paginated<LineaSimple>>;
    obtener(id: string): Promise<LineaSimple | null>;
}
