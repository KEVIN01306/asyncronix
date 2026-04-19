import type { RolUsuario } from "./rol.enum.js"


export interface Usuario {
    id: string,
    nombre: string,
    password_hash: string | null,
    telefono: string,
    rol: RolUsuario,
    activo: boolean | null,
    verificado: boolean | null,
    negocio_id: string,
    sucursal_id: string | null,
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

export interface UsuarioCrear extends Omit<Usuario, "id"> { }

export interface UsuarioActualizar extends Omit<Usuario, "id" | "activo" | "password_hash" | "verificado"> { }
