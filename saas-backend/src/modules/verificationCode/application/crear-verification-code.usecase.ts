import type { VerificationCodeRepository } from '../domain/verification-code.repository.js';
import { TipoVerificacion } from '../domain/verification-code.entity.js';
import type { EmailProvider } from '../../../shared/domain/providers/email.provider.js';
import { VerificationCodeTemplate } from '../../../shared/infrastructure/email/templates/verification-code.template.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import AppError from '@shared/errors/AppError.js';

interface CrearVerificationCodeInput {
  negocio_id: string;
  email: string;
  tipo: TipoVerificacion;
  expiraEnMinutos?: number;
}

export class CrearVerificationCodeUseCase {
  constructor(
    private readonly repository: VerificationCodeRepository,
    private readonly emailProvider: EmailProvider
  ) { }

  async run(input: CrearVerificationCodeInput): Promise<void> {
    try {
      const { negocio_id, email, tipo, expiraEnMinutos = 15 } = input;

      if (!email) {
        throw new AppError('El correo electrónico es requerido para generar el código.', 'INVALID_INPUT', 400);
      }

      // Invalidar códigos anteriores pendientes para este email y tipo
      await this.repository.invalidarCodigosAnteriores(negocio_id, email, tipo);

      // Generar código numérico aleatorio de 6 dígitos
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      const expira_at = new Date();
      expira_at.setMinutes(expira_at.getMinutes() + expiraEnMinutos);

      // Guardar en la base de datos
      await this.repository.crear({
        negocio_id,
        email,
        code,
        tipo,
        expira_at,
        usado: false,
      });

      // Enviar correo electrónico
      const html = VerificationCodeTemplate(code);
      await this.emailProvider.sendEmail({
        to: email,
        subject: 'Tu código de verificación - Asyncronix',
        html,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
      throw error;
    }
  }
}
