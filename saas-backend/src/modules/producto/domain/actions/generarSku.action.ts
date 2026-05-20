

interface GenerarSkuParams {
    negocioId: string;
    categoriaId: string;
    productoId: string;
    inicio: string;
}

export class GenerarSku {

    public static ejecutar(params: GenerarSkuParams): string {
        const extraerBloqueUnico = (uuid: string): string => {
            return uuid.slice(-12).toUpperCase();
        };

        const segmentoNegocio = extraerBloqueUnico(params.negocioId).substring(0, 4);
        const segmentoCategoria = extraerBloqueUnico(params.categoriaId).substring(0, 4);
        const segmentoProducto = extraerBloqueUnico(params.productoId);

        return `${params.inicio}-${segmentoNegocio}-${segmentoCategoria}-${segmentoProducto}`;
    }
}