export interface FacturaTermicaItem {
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    total: number;
}

export interface FacturaTermicaData {
    // Negocio y Sucursal
    negocio_nombre: string;
    negocio_nit: string;
    negocio_telefono?: string | null;
    sucursal_direccion: string;
    slogan?: string | null;

    // Emisor/Usuario
    atendido_por: string;

    // Documento Fiscal
    uuid?: string | null;
    serie?: string | null;
    numero?: string | null;
    fecha_emision: string | Date;

    // Cliente
    cliente_nombre: string;
    cliente_nit: string;

    // Productos
    items: FacturaTermicaItem[];

    // Totales
    subtotal: number;
    iva: number;
    descuento: number;
    total: number;
    total_letras: string;

    // Pagos
    efectivo_recibido?: number | null;
    cambio?: number | null;

    // Resolucion/Certificador
    certificador_nombre?: string;
    certificador_nit?: string;
    frases?: string[]; // Ej: "SUJETO A PAGOS TRIMESTRALES", "AGENTE RETENEDOR DE IVA"
}
