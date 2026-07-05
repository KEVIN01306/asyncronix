export interface Pais {
    id: string;
    codigo_iso: string;
    nombre: string;
    codigo_tel: string;
    moneda_id: string;
    locale?: string | null;
    activo: boolean;
    created_at: string;
    updated_at: string;
}
