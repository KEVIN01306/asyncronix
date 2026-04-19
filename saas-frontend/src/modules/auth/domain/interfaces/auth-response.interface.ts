export interface LoginResponse {
    accessToken: string;
    usuario: {
        id: string;
        nombre: string;
        rol: string;
        negocio_id: string;
    };
}