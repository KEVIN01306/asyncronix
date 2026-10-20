import AppError from "../../../../shared/errors/AppError.js";

export type RegimenFiscal = 'GEN' | 'PEQ';

export interface ConfiguracionRegimenFiscal {
    codigo: RegimenFiscal;
    nombre: string;
    docType: 'FACT' | 'FPEQ';
    porcentajeImpuestoDecimal: number; // 0.12 para GEN, 0.05 para PEQ
    porcentajeImpuesto: number;        // 12 para GEN, 5 para PEQ
}

export const REGIMENES_FISCALES: Record<RegimenFiscal, ConfiguracionRegimenFiscal> = {
    GEN: {
        codigo: 'GEN',
        nombre: 'Régimen General',
        docType: 'FACT',
        porcentajeImpuestoDecimal: 0.12,
        porcentajeImpuesto: 12
    },
    PEQ: {
        codigo: 'PEQ',
        nombre: 'Pequeño Contribuyente',
        docType: 'FPEQ',
        porcentajeImpuestoDecimal: 0.05,
        porcentajeImpuesto: 5
    }
};

/**
 * Obtiene la configuración tributaria tipada según la afiliación de IVA del negocio.
 * Si el régimen no es soportado, lanza un error de negocio claro.
 */
export function obtenerConfiguracionRegimen(afiliacionIva?: string | null): ConfiguracionRegimenFiscal {
    const normalizado = (afiliacionIva || 'GEN').toUpperCase().trim() as RegimenFiscal;

    const config = REGIMENES_FISCALES[normalizado];
    if (!config) {
        throw new AppError(
            `Régimen fiscal '${afiliacionIva}' no soportado para emisión de facturas. Regímenes válidos: GEN, PEQ`,
            "REGIMEN_FISCAL_NO_SOPORTADO",
            400
        );
    }

    return config;
}
