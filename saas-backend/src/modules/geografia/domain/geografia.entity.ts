export interface DivisionNivel1 {
    id: string;
    pais_id: string;
    nombre: string;
    codigo_iso: string | null;
    activo: boolean;
}

export interface DivisionNivel2 {
    id: string;
    division_nivel1_id: string;
    nombre: string;
    codigo_postal: string | null;
    activo: boolean;
}
