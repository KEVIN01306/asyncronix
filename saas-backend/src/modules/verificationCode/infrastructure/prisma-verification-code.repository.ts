import { PrismaClient } from '@prisma/client';
import type { VerificationCode, TipoVerificacion } from '../domain/verification-code.entity.js';
import type { VerificationCodeRepository } from '../domain/verification-code.repository.js';
import { PrismaErrorMapper } from '@shared/database/prisma/PrismaErrorMapper.js';

export class PrismaVerificationCodeRepository implements VerificationCodeRepository {
  constructor(private prisma: PrismaClient) { }

  async crear(codigo: VerificationCode): Promise<VerificationCode> {
    try {
      const data = await this.prisma.verificationCode.create({
        data: {
          negocio_id: codigo.negocio_id,
          email: codigo.email,
          code: codigo.code,
          tipo: codigo.tipo as any,
          expira_at: codigo.expira_at,
          usado: codigo.usado,
        }
      });
      return { ...data, tipo: data.tipo as TipoVerificacion };
    } catch (error: any) {
      throw PrismaErrorMapper.map(error);
    }
  }

  async buscarPorEmailYTipo(negocio_id: string, email: string, tipo: TipoVerificacion, code: string): Promise<VerificationCode | null> {
    try {
      const data = await this.prisma.verificationCode.findFirst({
        where: {
          negocio_id,
          email,
          tipo: tipo as any,
          code,
        },
        orderBy: { created_at: 'desc' }
      });
      return data ? { ...data, tipo: data.tipo as TipoVerificacion } : null;
    } catch (error: any) {
      throw PrismaErrorMapper.map(error);
    }
  }

  async marcarComoUsado(id: string): Promise<void> {
    try {
      await this.prisma.verificationCode.update({
        where: { id },
        data: { usado: true }
      });
    } catch (error: any) {
      throw PrismaErrorMapper.map(error);
    }
  }

  async invalidarCodigosAnteriores(negocio_id: string, email: string, tipo: TipoVerificacion): Promise<void> {
    try {
      await this.prisma.verificationCode.updateMany({
        where: {
          negocio_id,
          email,
          tipo: tipo as any,
          usado: false,
        },
        data: {
          usado: true // Invalidamos marcándolos como usados o se podrían eliminar
        }
      });
    } catch (error: any) {
      throw PrismaErrorMapper.map(error);
    }
  }
}
