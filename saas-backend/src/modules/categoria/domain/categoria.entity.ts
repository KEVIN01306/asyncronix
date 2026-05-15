export interface Categoria {
    id: string;
    negocio_id: string;
    categoria: string;
    default_categoria: boolean;
    activo: boolean;
}

export interface CategoriaCrear extends Omit<Categoria, "id" | "negocio_id" | "activo" | "default_categoria"> {
    default_categoria?: boolean;
    activo?: boolean;
}

export interface CategoriaActualizar extends Partial<Omit<Categoria, "id" | "negocio_id">> { }

export interface CategoriaSimple extends Omit<Categoria, "negocio_id"> { }
