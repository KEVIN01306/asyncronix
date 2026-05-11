

export default interface Rol {
    id: string,
    nombre: string,
    negocio_id: string,
    permisos: {
        id: string,
        codigo: string
    }[]
}