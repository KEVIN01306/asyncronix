import type { FacturaTermicaData } from '../interfaces/factura-termica.interface';

export const mockFacturaTermicaData: Partial<FacturaTermicaData> = {
    // Fictional data for the invoice
    uuid: '550e8400-e29b-41d4-a716-446655440000',
    serie: 'ABC',
    numero: '000000001',
    fecha_emision: new Date().toISOString(),

    // Fictional client
    cliente_nombre: 'CONSUMIDOR FINAL',
    cliente_nit: 'CF',

    // Fictional products
    items: [
        {
            descripcion: 'Aceite Motul 5100 10W40',
            cantidad: 1.00,
            precio_unitario: 85.00,
            total: 85.00,
        },
        {
            descripcion: 'Servicio de afinación',
            cantidad: 1.00,
            precio_unitario: 112.00,
            total: 112.00,
        }
    ],

    // Totales ficticios
    subtotal: 175.89, // (197 / 1.12)
    iva: 21.11, // (197 - 175.89)
    descuento: 0.00,
    total: 197.00,
    total_letras: 'CIENTO NOVENTA Y SIETE QUETZALES CON 00/100',

    // Fictional payment
    efectivo_recibido: 200.00,
    cambio: 3.00,

    // Fiscal info (Digifact setup)
    certificador_nombre: 'Digifact S.A.',
    certificador_nit: '77454820',
    frases: ['SUJETO A PAGOS TRIMESTRALES', 'AGENTE RETENEDOR DE IVA'],
};
