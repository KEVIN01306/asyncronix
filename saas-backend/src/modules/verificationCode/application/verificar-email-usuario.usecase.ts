import { VerificarVerificationCodeUseCase } from './verificar-verification-code.usecase.js';
import { TipoVerificacion } from '../domain/verification-code.entity.js';
import type { UsuarioRepository } from '../../usuarios/domain/usuario.repository.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import AppError from '@shared/errors/AppError.js';

interface VerificarEmailUsuarioInput {
  usuario_id: string;
  negocio_id: string;
  email: string;
  code: string;
}

export class VerificarEmailUsuarioUseCase {
  constructor(
    private readonly verificarVerificationCodeUseCase: VerificarVerificationCodeUseCase,
    private readonly usuarioRepository: UsuarioRepository
  ) { }

  async run(input: VerificarEmailUsuarioInput): Promise<void> {
    try {
      const { usuario_id, negocio_id, email, code } = input;

      // 1. Validar el código de verificación
      await this.verificarVerificationCodeUseCase.run({
        negocio_id,
        email,
        code,
        tipo: TipoVerificacion.REGISTRO_USUARIO,
      });

      // 2. Si es válido, actualizar el usuario marcándolo como verificado
      await this.usuarioRepository.marcarComoVerificado(usuario_id, negocio_id);
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
      throw error;
    }
  }
}
