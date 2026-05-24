import type { ApiResponse, PaginatedResponse } from "../../../../core/api/interfaces/api-response.interface";

export interface ChecklistItem {
    id: string;
    nombre: string;
    activo: boolean;
    created_at: string;
    updated_at: string;
}

export type ChecklistItemDetailResponse = ApiResponse<ChecklistItem>;
export type ChecklistItemsResponse = PaginatedResponse<ChecklistItem>;
