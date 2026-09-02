export interface Departamento {
    id: string;
    pais_id: string;
    nombre: string;
    codigo_iso: string | null;
    activo: boolean;
}

export interface Municipio {
    id: string;
    division_nivel1_id: string;
    nombre: string;
    codigo_postal: string | null;
    activo: boolean;
}
