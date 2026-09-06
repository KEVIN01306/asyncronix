interface MonedaConfig {
    plural: string;
    singular: string;
    centavos: string;
}

const UNIDADES: string[] = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
const ESPECIALES: string[] = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
const DECENAS: string[] = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
const CENTENAS: string[] = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

function convertirGrupo(n: number): string {
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;
    let salida = '';

    if (n === 100) return 'CIEN';

    if (c > 0) salida += CENTENAS[c] + ' ';

    if (d === 1) {
        salida += ESPECIALES[u];
    } else if (d === 2 && u > 0) {
        salida += `VEINTI${UNIDADES[u]}`;
    } else {
        if (d > 0) {
            salida += DECENAS[d];
            if (u > 0) salida += ` Y ${UNIDADES[u]}`;
        } else if (u > 0) {
            salida += UNIDADES[u];
        }
    }

    return salida.trim();
}

export function numeroALetras(
    monto: number,
    config: MonedaConfig = { singular: 'QUETZAL', plural: 'QUETZALES', centavos: 'CENTAVOS' }
): string {
    if (isNaN(monto) || monto < 0) return '';

    const entero = Math.floor(monto);
    const centavos = Math.round((monto - entero) * 100);
    const centavosFormato = `${centavos.toString().padStart(2, '0')}/100`;

    if (entero === 0) {
        return `CERO ${config.plural} CON ${centavosFormato}`;
    }

    const millones = Math.floor(entero / 1000000);
    const miles = Math.floor((entero % 1000000) / 1000);
    const unidades = entero % 1000;

    const partes: string[] = [];

    if (millones === 1) {
        partes.push('UN MILLÓN');
    } else if (millones > 1) {
        partes.push(`${convertirGrupo(millones)} MILLONES`);
    }

    if (miles === 1) {
        partes.push('MIL');
    } else if (miles > 1) {
        partes.push(`${convertirGrupo(miles)} MIL`);
    }

    if (unidades > 0) {
        partes.push(convertirGrupo(unidades));
    }

    const nombreMoneda = entero === 1 ? config.singular : config.plural;
    return `${partes.join(' ')} ${nombreMoneda} CON ${centavosFormato}`;
}