export interface Producto {
    id: string;
    negocio_id: string;
    categoria_id: string;
    marca_id: string;
    codigo?: string | null;
    sku?: string;
    nombre: string;
    descripcion?: string | null;
    precio_sugerido: number;
    stock_total: number;
    url_imagen: string;
    activo: boolean;
}

export interface ProductoMarca {
    id: string;
    marca: string;
}

export interface ProductoCategoria {
    id: string;
    categoria: string;
}

export interface ProductoCrear extends Omit<Producto, "id" | "negocio_id" | "sku" | "precio_sugerido" | "stock_total" | "activo" | "url_imagen"> { }

export interface ProductoActualizar extends Partial<Omit<Producto, "id" | "negocio_id" | "sku" | "precio_sugerido" | "stock_total" | "activo" | "url_imagen">> { }

export interface ProductoSimple extends Omit<Producto, "negocio_id"> {
    categoria: ProductoCategoria | null;
    marca: ProductoMarca | null;
}

export interface VariantePublic {
    id: string;
    sku: string | undefined;
    precio_sugerido: number | undefined;
    stock_total: number | undefined;
    codigo_barras: string | null | undefined;
    qr_codigo: string | null | undefined;
}

export interface ProductoAtributo {
    id: string;
    nombre: string;
}

export interface ProductoDetalle extends ProductoSimple {
    variantes?: VariantePublic[];
    negocio?: {
        id: string;
        slug: string;
    } | undefined;
    atributos?: ProductoAtributo[];
}
