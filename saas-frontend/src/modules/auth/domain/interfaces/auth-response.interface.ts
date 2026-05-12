export interface LoginResponse {
    accessToken: string;
    usuario: {
        id: string;
        nombre: string;
        roles: string[];
        permisos: string[];
        negocio_id: string;
        negocio?: {
            id: string;
            nombre_comercial: string;
            logo_url: string | null;
        } | null;
    };
}