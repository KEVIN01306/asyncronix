export interface Permiso {
    id: string;
    codigo: string;
    descripcion: string | null;
    modulo_id: string;
}

export interface Modulo {
    id: string;
    nombre: string;
    descripcion: string | null;
}

export interface PermisoAsignacion {
    permisoIds: string[];
}
