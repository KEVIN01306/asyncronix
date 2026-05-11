import type Rol from "./rol.entity.js";


export interface Usuario {
    id: string,
    nombre: string,
    apellido: string | null,
    email: string | null,
    password_hash: string | null,
    telefono: string,
    verificado: boolean,
    activo: boolean | null,
    negocio_id: string,
    sucursal_id: string | null,
    roles: string[]
}

export interface UsuarioObtenidoDetalle extends Omit<Usuario, "password_hash" | "negocio_id" | "activo" | "sucursal_id"> { 
    sucursal?: {
        id: string;
        nombre: string;
    } | null;
}

export interface UsuarioSimple extends Omit<Usuario, "password_hash" | "negocio_id" | "activo" | "verificado" | "sucursal_id"> { 
    sucursal?: {
        id: string;
        nombre: string;
    } | null;
}

export interface UsuarioCrear extends Omit<Usuario, "id" | "roles"> {
    rolIds: string[];
}

export interface UsuarioActualizar extends Omit<Usuario, "id" | "activo" | "password_hash" | "verificado" | "roles"> {
    rolIds: string[];
}
