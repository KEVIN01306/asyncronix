export enum TipoVerificacion {
  REGISTRO_USUARIO = 'REGISTRO_USUARIO',
  RECUPERACION_PASSWORD = 'RECUPERACION_PASSWORD',
  CAMBIO_EMAIL = 'CAMBIO_EMAIL'
}

export interface VerificationCode {
  id?: string;
  negocio_id: string;
  email: string;
  code: string;
  tipo: TipoVerificacion;
  expira_at: Date;
  usado: boolean;
  created_at?: Date;
}
