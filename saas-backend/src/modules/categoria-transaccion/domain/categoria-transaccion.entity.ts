export type TipoMovimientoTransaccion = 'INGRESO' | 'EGRESO';

export interface CategoriaTransaccion {
  id: string;
  negocio_id: string | null;
  nombre: string;
  tipo: TipoMovimientoTransaccion;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CategoriaTransaccionCrear {
  nombre: string;
  tipo: TipoMovimientoTransaccion;
  activo?: boolean;
}

export interface CategoriaTransaccionActualizar {
  nombre?: string;
  tipo?: TipoMovimientoTransaccion;
  activo?: boolean;
}

export interface CategoriaTransaccionSimple extends Omit<CategoriaTransaccion, 'negocio_id'> {
  negocio_id: string | null;
}
