import type { ApiResponse, PaginatedResponse } from '../../../../core/api/interfaces/api-response.interface';

export interface ProductoCategoria {
    id: string;
    categoria: string;
    categoria_padre_id?: string;
}

export interface VarianteValor {
    id?: string;
    valor: string;
    atributo?: {
        id: string;
        nombre: string;
    };
}

export interface Variante {
    id: string;
    imagen_id?: string | null;
    imagen?: {
        id: string;
        url: string;
        descripcion?: string | null;
        es_principal: boolean;
    } | null;
    sku?: string;
    correlativo?: string | null;
    codigo_barras?: string | null;
    qr_codigo?: string | null;
    precio_sugerido?: number;
    stock_total?: number;
    valores?: VarianteValor[];
    producto?: {
        id: string;
        nombre: string;
    };
}

export interface ProductoBusquedaDetalle {
    producto: Producto;
    varianteSeleccionada: Variante;
    variantes: Variante[];
}

export interface ProductoAtributo {
    id: string;
    nombre: string;
}

export interface Producto {
    id: string;
    categoria_id: string;
    marca_id: string;
    nombre: string;
    sku: string;
    precio_sugerido: number;
    stock_total: number;
    url_imagen?: string | null;
    imagenes?: ImagenProducto[];
    qr_imagen?: string | null;
    activo: boolean;
    categoria: ProductoCategoria | null;
    marca: {
        id: string;
        marca: string;
    } | null;
    variantes?: Variante[];
    atributos?: ProductoAtributo[];
}

export interface ImagenProducto {
    id: string;
    producto_id: string;
    url: string;
    descripcion?: string | null;
    es_principal: boolean;
}

export type ProductoDetailResponse = ApiResponse<Producto>;
export type ProductosResponse = PaginatedResponse<Producto>;
