export type CategoriaTransaccionTipo = 'INGRESO' | 'EGRESO';

export interface CategoriaTransaccion {
  id: string;
  negocio_id: string | null;
  nombre: string;
  tipo: CategoriaTransaccionTipo;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoriaTransaccionFormValues {
  nombre: string;
  tipo: CategoriaTransaccionTipo;
  activo: boolean;
}

export interface CategoriaTransaccionListResponse {
  data: CategoriaTransaccion[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface CategoriaTransaccionApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}
