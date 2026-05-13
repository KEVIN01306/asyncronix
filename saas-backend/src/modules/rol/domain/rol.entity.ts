export interface Rol {
    id: string
    nombre: string
    descripcion: string | null
    activo: boolean | null
    negocio_id: string
    permisos: {
        id: string
        codigo: string
    }[]
}

export interface RolSimple extends Omit<Rol, "negocio_id" | "activo"> {}
export interface RolObtenidoDetalle extends RolSimple {}

export interface RolCrear extends Omit<Rol, "id" | "activo"> {
    permisoIds: string[]
}

export interface RolActualizar extends Omit<Rol, "id" | "activo" | "negocio_id"> {
    permisoIds: string[]
}
