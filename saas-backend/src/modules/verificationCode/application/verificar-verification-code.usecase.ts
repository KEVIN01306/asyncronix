import type { VerificationCodeRepository } from '../domain/verification-code.repository.js';
import { TipoVerificacion } from '../domain/verification-code.entity.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import AppError from '@shared/errors/AppError.js';

interface VerificarVerificationCodeInput {
  negocio_id: string;
  email: string;
  code: string;
  tipo: TipoVerificacion;
}

export class VerificarVerificationCodeUseCase {
  constructor(private readonly repository: VerificationCodeRepository) { }

  async run(input: VerificarVerificationCodeInput): Promise<void> {
    try {
      const { negocio_id, email, code, tipo } = input;

      const verificationCode = await this.repository.buscarPorEmailYTipo(negocio_id, email, tipo, code);

      if (!verificationCode) {
        throw new AppError('El código de verificación es inválido o no existe.', 'INVALID_CODE', 400);
      }

      if (verificationCode.usado) {
        throw new AppError('El código de verificación ya ha sido utilizado.', 'CODE_USED', 400);
      }

      if (verificationCode.expira_at < new Date()) {
        throw new AppError('El código de verificación ha expirado. Por favor, solicita uno nuevo.', 'CODE_EXPIRED', 400);
      }

      // Marcar como usado si es válido
      if (verificationCode.id) {
        await this.repository.marcarComoUsado(verificationCode.id);
      } else {
        throw new AppError('Error interno: El código de verificación no tiene ID.', 'INTERNAL_ERROR', 500);
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
      throw error;
    }
  }
}
