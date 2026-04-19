export interface Cliente {
    id: string;
    negocio_id: string;
    nombre: string | null;
    telefono: string;
    email: string | null;
    direccion_entrega: string | null;
    fecha_registro: Date | null;
}

export interface ClienteObtenidoDetalle extends Omit<Cliente, "negocio_id"> { }

export interface ClienteSimple extends Pick<Cliente, "id" | "nombre" | "telefono" | "email"> { }

export interface ClienteCrear extends Omit<Cliente, "id" | "fecha_registro" | "negocio_id"> { }

export interface ClienteActualizar extends Partial<ClienteCrear> { }
