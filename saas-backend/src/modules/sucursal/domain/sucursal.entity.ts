import type { CajaSimple } from '../../caja/domain/caja.entity.js';
import type { CuentaBancariaSimple } from '../../cuenta-bancaria/domain/cuenta-bancaria.entity.js';

export interface Sucursal {
    id: string;
    negocio_id: string;
    nombre: string;
    es_principal: boolean | null;
    direccion: string | null;
}

export interface SucursalObtenidoDetalle extends Omit<Sucursal, "negocio_id"> { }

export interface SucursalSimple extends Omit<Sucursal, "negocio_id"> { }

export interface SucursalCuentaBancaria {
    metodo_pago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO';
    cuenta_bancaria: CuentaBancariaSimple;
}

export type SucursalMiDetalle = SucursalObtenidoDetalle & {
    cajas: CajaSimple[];
    cuentas_bancarias: SucursalCuentaBancaria[];
    usuarios_count: number;
};

export interface SucursalCrear extends Omit<Sucursal, "id" | "negocio_id" | "es_principal"> { }

export interface SucursalCrearPersistencia extends SucursalCrear {}

export interface SucursalActualizar extends Partial<SucursalCrear> { }
