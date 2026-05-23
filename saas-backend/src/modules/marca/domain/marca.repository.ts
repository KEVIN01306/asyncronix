import type { Paginated } from "@shared/domain/paginated.js";
import type { MarcaSimple } from "./marca.entity.js";

export interface MarcaRepository {
    listar(params: { page: number; perPage: number }): Promise<Paginated<MarcaSimple>>;
    obtener(id: string): Promise<MarcaSimple | null>;
}
