export interface Categoria {
    id: string;
    negocio_id: string;
    nombre: string;
    descripcion: string | null;
}

export interface CategoriaCrear extends Omit<Categoria, "id" | "negocio_id"> { }

export interface CategoriaActualizar extends Partial<Omit<Categoria, "id" | "negocio_id">> { }

export interface CategoriaSimple extends Omit<Categoria, "negocio_id"> { }
