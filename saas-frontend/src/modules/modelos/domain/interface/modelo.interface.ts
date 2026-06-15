import type { Cilindrada } from "../../../cilindradas/infrastructure/cilindradas.repository";
import type { Linea } from "../../../lineas/domain/interface/linea.interface";
import type { Marca } from "../../../marcas/domain/interface/marca.interface";



export interface Modelo {
    id: string;
    modelo: string;
    anio: number;
    marca_id: string;
    marca?: Marca;
    linea_id: string;
    linea?: Linea;
    cilindrada_id: string;
    cilindrada?: Cilindrada;
    created_at: string;
    updated_at: string;
};
