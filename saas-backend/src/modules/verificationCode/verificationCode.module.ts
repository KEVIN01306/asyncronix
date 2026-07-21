import prisma from '@infrastructure/config/prisma.js';
import { PrismaVerificationCodeRepository } from './infrastructure/prisma-verification-code.repository.js';
import { PrismaUsuarioRepository } from '../usuarios/infrastructure/prisma-usuario.repository.js';
import { ResendEmailProvider } from '@shared/infrastructure/providers/resend-email.provider.js';
import { CrearVerificationCodeUseCase } from './application/crear-verification-code.usecase.js';
import { VerificarVerificationCodeUseCase } from './application/verificar-verification-code.usecase.js';
import { VerificarEmailUsuarioUseCase } from './application/verificar-email-usuario.usecase.js';
import { ObtenerEstadoCodigoUseCase } from './application/obtener-estado-codigo.usecase.js';
import { VerificationCodeController } from './presentation/verification-code.controller.js';

const verificationCodeRepository = new PrismaVerificationCodeRepository(prisma as any);
const usuarioRepository = new PrismaUsuarioRepository(prisma as any);
const emailProvider = new ResendEmailProvider();

const crearVerificationCodeUseCase = new CrearVerificationCodeUseCase(verificationCodeRepository, emailProvider);
const verificarVerificationCodeUseCase = new VerificarVerificationCodeUseCase(verificationCodeRepository);
const verificarEmailUsuarioUseCase = new VerificarEmailUsuarioUseCase(verificarVerificationCodeUseCase, usuarioRepository);
const obtenerEstadoCodigoUseCase = new ObtenerEstadoCodigoUseCase(verificationCodeRepository);

export const verificationCodeController = new VerificationCodeController(
  crearVerificationCodeUseCase,
  verificarEmailUsuarioUseCase,
  obtenerEstadoCodigoUseCase,
  usuarioRepository
);
