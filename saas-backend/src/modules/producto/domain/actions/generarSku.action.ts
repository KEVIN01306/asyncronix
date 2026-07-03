
const DIGITOS_MIN_PRODUCTO = 5;
const DIGITOS_MIN_VARIANTE = 2;
const LONGITUD_QR = 13;
const PREFIJO_QR = '2';

export class GenerarSku {
    private static normalizarCategoria(categoria: string): string {
        const limpio = categoria
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '');

        if (!limpio) return 'GEN';
        return limpio.slice(0, 3).padEnd(3, 'X');
    }

    private static formatearCorrelativo(valor: number, minDigits: number): string {
        const correlativo = Math.max(1, Math.trunc(valor));
        const bruto = String(correlativo);
        return bruto.length >= minDigits ? bruto : bruto.padStart(minDigits, '0');
    }

    static generarSkuProducto(categoria: string, correlativo: number): string {
        const prefijo = this.normalizarCategoria(categoria);
        return `${prefijo}-${this.formatearCorrelativo(correlativo, DIGITOS_MIN_PRODUCTO)}`;
    }

    static generarSkuVariante(skuProducto: string, correlativoVariante: number): string {
        return `${skuProducto}-${this.formatearCorrelativo(correlativoVariante, DIGITOS_MIN_VARIANTE)}`;
    }

    static generarCodigoQrVariante(correlativoVariante: number): string {
        const valor = String(Math.max(1, Math.trunc(correlativoVariante)));
        if (valor.length > LONGITUD_QR - 1) {
            throw new Error('VARIANTE_CORRELATIVO_TOO_LARGE_FOR_QR');
        }

        const cuerpo = valor.length >= LONGITUD_QR - 1
            ? valor
            : valor.padStart(LONGITUD_QR - 1, '0');

        return `${PREFIJO_QR}${cuerpo}`;
    }
}