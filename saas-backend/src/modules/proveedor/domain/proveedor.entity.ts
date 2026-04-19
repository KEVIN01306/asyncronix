export interface Proveedor {
    id: string;
    negocio_id: string;
    nombre: string;
    telefono: string | null;
}

export interface ProveedorObtenidoDetalle extends Omit<Proveedor, "negocio_id"> {}

export interface ProveedorSimple extends Pick<Proveedor, "id" | "nombre" | "telefono"> {}


export interface ProveedorCrear extends Omit<Proveedor, "id" | "negocio_id"> { }

export interface ProveedorActualizar extends Partial<ProveedorCrear> { }
