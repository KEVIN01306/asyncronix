export interface Proveedor {
    id: string;
    negocio_id: string;
    nombre: string;
    contacto?: string | null;
    telefono: string;
    email?: string | null;
    nit?: string | null;
    activo: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface ProveedorObtenidoDetalle extends Omit<Proveedor, 'negocio_id'> { }

export interface ProveedorSimple extends Pick<Proveedor, 'id' | 'nombre' | 'telefono' | 'email' | 'nit'> { }

export interface ProveedorCrear extends Omit<Proveedor, 'id' | 'created_at' | 'updated_at' | 'negocio_id' | 'activo'> { }

export interface ProveedorActualizar extends Partial<ProveedorCrear> { }
