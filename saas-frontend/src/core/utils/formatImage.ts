
/**
 * Formatear imagen para mostrar en el frontend 
 * @param url - URL de la imagen
 * @returns URL formateada
 */


export const formatImage = (url: string | null | undefined): string | undefined => {
    return url ? url : undefined;
}