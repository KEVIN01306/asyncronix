/**
 * Estados de servicio disponibles en el taller
 */
export const ESTADO_SERVICIO = {
    RECEPCION: 'RECEPCION',
    EN_SERVICIO: 'EN_SERVICIO',
    EN_PRUEBAS: 'EN_PRUEBAS',
    EN_DIAGNOSTICO: 'EN_DIAGNOSTICO',
    ESPERA_REPUESTOS: 'ESPERA_REPUESTOS',
    EN_REPARACION: 'EN_REPARACION',
    LISTO_ENTREGA: 'LISTO_ENTREGA',
    FINALIZADO: 'FINALIZADO',
    CANCELADO: 'CANCELADO'
} as const;

export type EstadoServicio = typeof ESTADO_SERVICIO[keyof typeof ESTADO_SERVICIO];

/**
 * Métodos de pago disponibles
 */
export const METODO_PAGO = {
    EFECTIVO: 'EFECTIVO',
    TARJETA: 'TARJETA',
    TRANSFERENCIA: 'TRANSFERENCIA',
    OTRO: 'OTRO'
} as const;

export type MetodoPago = typeof METODO_PAGO[keyof typeof METODO_PAGO];

/**
 * Estados del checklist
 */
export const CHECKLIST_ESTADOS = ['OPTIMO', 'REGULAR', 'REQUIERE_CAMBIO', 'NO_APLICA'] as const;
export type ChecklistEstado = typeof CHECKLIST_ESTADOS[number];
