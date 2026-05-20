export interface Producto {
    id: string;
    negocio_id: string;
    categoria_id: string;
    nombre: string;
    codigo: string | null;
    sku: string;
    precio_sugerido: number;
    stock_total: number;
    url_imagen: string;
    qr_imagen: string | null;
    activo: boolean;
}

export interface ProductoCategoria {
    id: string;
    categoria: string;
}

export interface ProductoCrear extends Omit<Producto, "id" | "negocio_id" | "qr_imagen"> { }

export interface ProductoActualizar extends Partial<Omit<Producto, "id" | "negocio_id" | "sku" | "qr_imagen">> { }

export interface ProductoSimple extends Omit<Producto, "negocio_id" | "sku"> {
    categoria: ProductoCategoria | null;
}

export interface ProductoDetalle extends Omit<Producto, "negocio_id"> {
    categoria: ProductoCategoria | null;
}
