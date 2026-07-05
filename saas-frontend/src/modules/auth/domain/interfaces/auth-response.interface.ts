export interface LoginResponse {
    accessToken: string;
    usuario: {
        id: string;
        nombre: string;
        apellido: string | null;
        email: string | null;
        telefono: string;
        avatar_url: string | null;
        roles: string[];
        permisos: string[];
        negocio_id: string;
        sucursal_id: string | null;
        negocio?: {
            id: string;
            nombre_comercial: string;
            logo_url: string | null;
            pais?: {
                id: string;
                codigo_iso: string;
                nombre: string;
                codigo_tel: string;
                moneda_id: string;
                locale?: string | null;
                activo: boolean;
                created_at: string;
                updated_at: string;
            } | null;
            moneda?: {
                id: string;
                codigo: string;
                nombre: string;
                simbolo: string;
                activo: boolean;
                created_at: string;
                updated_at: string;
            } | null;
        } | null;
    };
}