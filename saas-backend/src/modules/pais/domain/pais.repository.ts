import type { Paginated } from "@shared/domain/paginated.js";
import type { PaisSimple } from "./pais.entity.js";

export interface PaisRepository {
    listar(params: { page: number; perPage: number; filters?: { q?: string } }): Promise<Paginated<PaisSimple>>;
    obtener(id: string): Promise<PaisSimple | null>;
}
