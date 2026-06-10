

interface GenerarSkuParams {
    negocioCodigo?: string;
    marcaCodigo?: string;
    categoriaCodigo: string;
    productoCodigo: string;
    valores?: string[];
}

export class GenerarSku {

    public static ejecutar(params: GenerarSkuParams): string {
        const normalizar = (valor: string): string => {
            return valor
                .trim()
                .toUpperCase()
                .replace(/\s+/g, '-')
                .replace(/[^A-Z0-9-]/g, '');
        };

        const obtenerPrefijoNegocio = (codigo?: string): string => {
            const normalizado = normalizar(codigo ?? 'ASC');
            return normalizado.substring(0, 3) || 'ASC';
        };

        const segmentoNegocio = obtenerPrefijoNegocio(params.negocioCodigo);
        const segmentoMarca = params.marcaCodigo ? normalizar(params.marcaCodigo).substring(0, 4) : undefined;
        const segmentoCategoria = normalizar(params.categoriaCodigo).substring(0, 4) || 'CAT';
        const segmentoProducto = normalizar(params.productoCodigo) || 'PROD';
        const segmentoValores = (params.valores ?? [])
            .map(normalizar)
            .filter(Boolean);

        return [segmentoNegocio, segmentoMarca, segmentoCategoria, segmentoProducto, ...segmentoValores]
            .filter(Boolean)
            .join('-');
    }
}