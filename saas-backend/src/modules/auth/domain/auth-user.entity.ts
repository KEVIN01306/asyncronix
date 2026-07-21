export interface UsuarioAutentificacion {
    id: string,
    nombre: string,
    apellido: string | null,
    email: string | null,
    avatar_url: string | null,
    password_hash: string | null,
    telefono: string,
    verificado: boolean,
    activo: boolean | null,
    negocio_id: string,
    sucursal_id: string | null,
    permisos: string[],
    roles: string[]
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
            created_at: Date;
            updated_at: Date;
        } | null;
        moneda?: {
            id: string;
            codigo: string;
            nombre: string;
            simbolo: string;
            activo: boolean;
            created_at: Date;
            updated_at: Date;
        } | null;
    } | null;
}