import type { CategoriaGasto } from "./gastos_categoria.enum.js";




export interface Gasto {
    id: string;
    negocio_id: string;
    sucursal_id: string;
    monto: number;
    descripcion: string | null;
    categoria_gasto: CategoriaGasto
    fecha: Date;
}

interface Sucursal {
    id: string;
    nombre: string;
}

export interface GastoCrear extends Omit<Gasto, "id" | "negocio_id"> { }

export interface GastoActualizar extends Partial<Omit<Gasto, "id" | "negocio_id">> { }

export interface GastoDetalle extends Omit<Gasto, "negocio_id" | "sucursal_id"> {
    sucursal: Sucursal;
}

export interface GastoSimple extends Omit<Gasto, "negocio_id" | "descripcion" | "sucursal_id"> {
    sucursal: Sucursal;
}
