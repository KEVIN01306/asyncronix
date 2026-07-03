export interface Categoria {
    id: string;
    negocio_id: string;
    categoria: string;
    default_categoria: boolean;
    activo: boolean;
    categoria_padre_id?: string;
}

export interface CategoriaCrear extends Omit<Categoria, "id" | "negocio_id" | "activo" | "default_categoria"> {
    default_categoria?: boolean;
    activo?: boolean;
    categoria_padre_id?: string;
}

export interface CategoriaActualizar extends Partial<Omit<Categoria, "id" | "negocio_id">> { }

export interface CategoriaSimple extends Omit<Categoria, "negocio_id"> { }

export interface CategoriaPadre {
    id: string;
    categoria: string;
    default_categoria: boolean;
}

export interface CategoriaConJerarquia extends CategoriaSimple {
    categoria_padre?: CategoriaPadre;
    subcategorias?: CategoriaSimple[];
}

export interface CategoriaJerarquiaCompleta extends CategoriaSimple {
    jerarquia: {
        id: string;
        categoria: string;
        nivel: number;
    }[];
}
