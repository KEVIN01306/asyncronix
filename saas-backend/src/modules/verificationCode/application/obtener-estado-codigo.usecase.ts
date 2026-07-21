import type { VerificationCodeRepository } from '../domain/verification-code.repository.js';
import { TipoVerificacion } from '../domain/verification-code.entity.js';
import AppError from '@shared/errors/AppError.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';

interface ObtenerEstadoCodigoInput {
  negocio_id: string;
  email: string;
  tipo: TipoVerificacion;
}

interface EstadoCodigoResponse {
  active: boolean;
  timeLeft: number;
}

export class ObtenerEstadoCodigoUseCase {
  constructor(private readonly repository: VerificationCodeRepository) { }

  async run(input: ObtenerEstadoCodigoInput): Promise<EstadoCodigoResponse> {
    try {
      const { negocio_id, email, tipo } = input;

      const ultimoCodigo = await this.repository.buscarUltimoPorEmailYTipo(negocio_id, email, tipo);

      if (!ultimoCodigo) {
        console.log('no hay codigo: ', ultimoCodigo)
        return { active: false, timeLeft: 0 };
      }

      const ahora = new Date();
      if (ahora > ultimoCodigo.expira_at) {
        console.log('tiempo expirado: ', ahora, ultimoCodigo.expira_at)
        return { active: false, timeLeft: 0 };
      }

      const timeLeftMs = ultimoCodigo.expira_at.getTime() - ahora.getTime();
      const timeLeft = Math.floor(timeLeftMs / 1000);
      console.log('tiempo restante: ', timeLeft)

      return { active: true, timeLeft };
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
      throw error;
    }
  }
}
