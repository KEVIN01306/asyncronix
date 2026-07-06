import type { ApiResponse, PaginatedResponse } from "../../../../core/api/interfaces/api-response.interface";
import type { Caja } from '../../../caja/domain/interfaces/caja.interface';
import type { CuentaBancaria } from '../../../cuenta-bancaria/domain/interfaces/cuenta-bancaria.interface';

export interface Sucursal {
    id: string;
    nombre: string;
    direccion: string;
    es_principal: boolean;
    negocio_id?: string;
}

export interface SucursalCuentaBancaria {
    metodo_pago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO';
    cuenta_bancaria: CuentaBancaria;
}

export type SucursalMiDetalle = Omit<Sucursal, 'negocio_id'> & {
    cajas: Caja[];
    cuentas_bancarias: SucursalCuentaBancaria[];
    usuarios_count: number;
};

export type SucursalesResponse = PaginatedResponse<Sucursal>;

export type SucursalDetailResponse = ApiResponse<Sucursal>;

export type SucursalMiDetalleResponse = ApiResponse<SucursalMiDetalle>;