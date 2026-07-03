export interface Modelo {
    id: string;
    modelo: string;
    anio: number;
    marca_id: string;
    linea_id: string;
    cilindrada_id: string;
    activo: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface ModeloSimple {
    id: string;
    modelo: string;
    anio: number;
    marca_id: string;
    marca?: string;
    linea_id: string;
    linea?: string;
    cilindrada_id: string;
    cilindrada?: number;
    created_at: Date;
    updated_at: Date;
}

export interface ModeloCrear {
    modelo?: string; // se genera en el backend (marca + linea + anio)
    anio: number;
    marca_id: string;
    linea_id: string;
    cilindrada_id: string;
    vehiculo_tipo_id: string;
}
