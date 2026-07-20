import api from '../../../../core/api/api';

export interface MediaItem {
    id: string;
    path: string;
    size_bytes: number;
    mime_type: string;
    created_at: string;
}

export interface MediaResponse {
    total: number;
    data: MediaItem[];
}

export class MediaRepository {
    async listar(page: number = 1, perPage: number = 10): Promise<MediaResponse> {
        const response: any = await api.get('/media', { params: { page, perPage } });
        return {
            data: response.data || [],
            total: response.meta?.total || 0
        };
    }
}

export const mediaRepository = new MediaRepository();
