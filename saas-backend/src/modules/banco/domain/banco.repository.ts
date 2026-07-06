import type { Paginated } from "@shared/domain/paginated.js";
import type { BancoSimple } from "./banco.entity.js";

export interface BancoRepository {
    listar(params: { page: number; perPage: number; filters?: { q?: string } }): Promise<Paginated<BancoSimple>>;
    obtener(id: string): Promise<BancoSimple | null>;
}
