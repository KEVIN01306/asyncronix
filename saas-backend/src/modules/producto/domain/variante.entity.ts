export interface ValorAtributoDetalle {
    id: string;
    atributo_id: string;
    valor: string;
    atributo?: {
        id: string;
        nombre: string;
    };
}

export interface VarianteDetalle {
    id: string;
    producto_id: string;
    sku: string;
    codigo_barras?: string | null;
    codigo_secuencial?: string | null;
    qr_codigo?: string | null;
    precio_sugerido: number;
    stock_total: number;
    activo: boolean;
    url_imagen: string;
    valores?: ValorAtributoDetalle[];
    producto?: {
        id: string;
        nombre: string;
    };
}

export interface VarianteCrear {
    producto_id: string;
    precio_sugerido: number;
    codigo_barras?: string | null;
    valor_atributo_ids?: string[];
}

export interface VarianteActualizar {
    precio_sugerido?: number;
    codigo_barras?: string | null;
    valor_atributo_ids?: string[];
}

