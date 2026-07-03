import type { Paginated } from "@shared/domain/paginated.js";
import type { CilindradaSimple } from "./cilindrada.entity.js";

export interface CilindradaRepository {
    listar(params: { page: number; perPage: number; filters?: { q?: string } }): Promise<Paginated<CilindradaSimple>>;
    obtener(id: string): Promise<CilindradaSimple | null>;
}
