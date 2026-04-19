export interface Producto {
    id: string;
    negocio_id: string;
    categoria_id: string | null;
    nombre: string;
    descripcion: string | null;
}

export interface ProductoImagen {
    id: string;
    producto_id: string;
    sku_id: string | null;
    url_imagen: string;
    es_principal: boolean;
}

export interface ProductoCrear extends Omit<Producto, "id" | "negocio_id"> { }

export interface ProductoActualizar extends Partial<Omit<Producto, "id" | "negocio_id">> { }

export interface ProductoSimple extends Omit<Producto, "negocio_id" | "descripcion"> {
    categoria: {
        id: string;
        nombre: string;
    } | null;
}

export interface ProductoDetalle extends Omit<Producto, "negocio_id"> {
    categoria: {
        id: string;
        nombre: string;
    } | null;
    imagenes: ProductoImagen[];
}

// DTOs para imagenes
export interface ProductoImagenCrear extends Omit<ProductoImagen, "id"> { }
export interface ProductoImagenActualizar extends Partial<Omit<ProductoImagen, "id" | "producto_id" | "url_imagen">> { }
