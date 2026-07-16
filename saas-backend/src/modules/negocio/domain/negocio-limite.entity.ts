export enum LimiteNegocio {
    USUARIOS = 'Usuarios',
    SUCURSALES = 'Sucursales',
    PRODUCTOS = 'Productos',
    VARIANTES = 'Variantes',
    VEHICULOS = 'Vehículos',
    CAJAS = 'Cajas',
    CUENTAS_BANCARIAS = 'Cuentas bancarias'
}

export interface NegocioLimite {
    id: string;
    negocio_id: string;
    max_usuarios: number;
    max_sucursales: number;
    max_productos: number;
    max_variantes: number;
    max_vehiculos: number;
    max_cajas: number;
    max_cuentas_bancarias: number;
}

export interface NegocioLimiteItem {
    nombre: string;
    limite: number;
    utilizados: number;
    disponibles: number | null;
    porcentaje_utilizado: number | null;
    ilimitado: boolean;
    limite_alcanzado: boolean;
}
