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
    imagen_id?: string | null;
    sku: string;
    codigo_barras?: string | null;
    codigo_secuencial?: string | null;
    qr_codigo?: string | null;
    precio_sugerido: number;
    stock_total: number;
    activo: boolean;
    imagen?: {
        id: string;
        url: string;
        descripcion?: string | null;
        es_principal: boolean;
    } | null;
    valores?: ValorAtributoDetalle[];
    producto?: {
        id: string;
        nombre: string;
    };
}

export interface VarianteCrear {
    producto_id: string;
    imagen_id?: string | null;
    precio_sugerido: number;
    codigo_barras?: string | null;
    valor_atributo_ids?: string[];
    sku?: string;
    codigo_secuencial?: string | null;
}

export interface VarianteActualizar {
    imagen_id?: string | null;
    precio_sugerido?: number;
    codigo_barras?: string | null;
    valor_atributo_ids?: string[];
}

