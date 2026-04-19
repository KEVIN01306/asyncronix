export interface Sucursal {
    id: string;
    negocio_id: string;
    nombre: string;
    es_principal: boolean | null;
    direccion: string | null;
}

export interface SucursalObtenidoDetalle extends Omit<Sucursal, "negocio_id"> { }

export interface SucursalSimple extends Omit<Sucursal, "negocio_id"> { }

export interface SucursalCrear extends Omit<Sucursal, "id" | "negocio_id" | "es_principal"> { }

export interface SucursalCrearPersistencia extends SucursalCrear {
    es_principal: boolean;
}

export interface SucursalActualizar extends Partial<SucursalCrear> { }
