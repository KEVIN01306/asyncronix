import type { VerificationCode, TipoVerificacion } from './verification-code.entity.js';

export interface VerificationCodeRepository {
  crear(codigo: VerificationCode): Promise<VerificationCode>;
  buscarPorEmailYTipo(negocio_id: string, email: string, tipo: TipoVerificacion, code: string): Promise<VerificationCode | null>;
  buscarUltimoPorEmailYTipo(negocio_id: string, email: string, tipo: TipoVerificacion): Promise<VerificationCode | null>;
  marcarComoUsado(id: string): Promise<void>;
  invalidarCodigosAnteriores(negocio_id: string, email: string, tipo: TipoVerificacion): Promise<void>;
}
